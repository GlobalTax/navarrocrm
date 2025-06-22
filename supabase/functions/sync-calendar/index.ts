
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncCalendarRequest {
  action: 'create_event' | 'update_event' | 'delete_event' | 'import_events'
  event_id?: string
  outlook_event_id?: string
  org_id: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, event_id, outlook_event_id, org_id }: SyncCalendarRequest = await req.json()
    
    // Obtener token del usuario
    const { data: userToken } = await supabase
      .from('user_outlook_tokens')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('org_id', org_id)
      .eq('is_active', true)
      .single()

    if (!userToken) {
      throw new Error('Token de Outlook no encontrado o expirado')
    }

    // Verificar si el token ha expirado
    if (new Date(userToken.token_expires_at) <= new Date()) {
      throw new Error('Token expirado, requiere renovación')
    }

    const accessToken = userToken.access_token_encrypted // Descifrar en producción

    async function logSyncAction(sync_type: string, sync_status: string, error_message?: string, sync_data?: any) {
      await supabase.from('calendar_sync_log').insert({
        org_id,
        user_id: userToken.user_id,
        event_id,
        sync_type,
        sync_direction: 'to_outlook',
        outlook_event_id,
        sync_status,
        error_message,
        sync_data
      })
    }

    switch (action) {
      case 'create_event': {
        // Obtener el evento de nuestra base de datos
        const { data: event } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('id', event_id)
          .single()

        if (!event) {
          throw new Error('Evento no encontrado')
        }

        // Crear evento en Outlook
        const outlookEvent = {
          subject: event.title,
          body: {
            contentType: "HTML",
            content: event.description || ''
          },
          start: {
            dateTime: event.start_datetime,
            timeZone: "Europe/Madrid"
          },
          end: {
            dateTime: event.end_datetime,
            timeZone: "Europe/Madrid"
          },
          location: {
            displayName: event.location || ''
          },
          isAllDay: event.is_all_day,
          attendees: event.attendees_emails?.map(email => ({
            emailAddress: { address: email, name: email }
          })) || []
        }

        const createResponse = await fetch('https://graph.microsoft.com/v1.0/me/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(outlookEvent)
        })

        const createdEvent = await createResponse.json()

        if (!createResponse.ok) {
          await logSyncAction('create', 'failed', createdEvent.error?.message)
          throw new Error(`Error creando evento en Outlook: ${createdEvent.error?.message}`)
        }

        // Actualizar evento local con ID de Outlook
        await supabase
          .from('calendar_events')
          .update({
            outlook_id: createdEvent.id,
            sync_status: 'synced',
            last_synced_at: new Date().toISOString(),
            outlook_meeting_url: createdEvent.onlineMeeting?.joinUrl
          })
          .eq('id', event_id)

        await logSyncAction('create', 'success', undefined, { outlook_id: createdEvent.id })

        return new Response(
          JSON.stringify({ success: true, outlook_id: createdEvent.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_event': {
        const { data: event } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('id', event_id)
          .single()

        if (!event || !event.outlook_id) {
          throw new Error('Evento no encontrado o no sincronizado')
        }

        const outlookEvent = {
          subject: event.title,
          body: {
            contentType: "HTML",
            content: event.description || ''
          },
          start: {
            dateTime: event.start_datetime,
            timeZone: "Europe/Madrid"
          },
          end: {
            dateTime: event.end_datetime,
            timeZone: "Europe/Madrid"
          },
          location: {
            displayName: event.location || ''
          },
          isAllDay: event.is_all_day
        }

        const updateResponse = await fetch(`https://graph.microsoft.com/v1.0/me/events/${event.outlook_id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(outlookEvent)
        })

        if (!updateResponse.ok) {
          const error = await updateResponse.json()
          await logSyncAction('update', 'failed', error.error?.message)
          throw new Error(`Error actualizando evento en Outlook: ${error.error?.message}`)
        }

        await supabase
          .from('calendar_events')
          .update({
            sync_status: 'synced',
            last_synced_at: new Date().toISOString()
          })
          .eq('id', event_id)

        await logSyncAction('update', 'success')

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete_event': {
        const { data: event } = await supabase
          .from('calendar_events')
          .select('outlook_id')
          .eq('id', event_id)
          .single()

        if (event?.outlook_id) {
          const deleteResponse = await fetch(`https://graph.microsoft.com/v1.0/me/events/${event.outlook_id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` }
          })

          if (!deleteResponse.ok && deleteResponse.status !== 404) {
            const error = await deleteResponse.json()
            await logSyncAction('delete', 'failed', error.error?.message)
            throw new Error(`Error eliminando evento en Outlook: ${error.error?.message}`)
          }
        }

        await logSyncAction('delete', 'success')

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'import_events': {
        // Importar eventos desde Outlook
        const eventsResponse = await fetch(
          'https://graph.microsoft.com/v1.0/me/events?$top=50&$orderby=createdDateTime desc',
          {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }
        )

        const eventsData = await eventsResponse.json()

        if (!eventsResponse.ok) {
          throw new Error(`Error obteniendo eventos de Outlook: ${eventsData.error?.message}`)
        }

        const importedEvents = []

        for (const outlookEvent of eventsData.value) {
          // Verificar si ya existe
          const { data: existingEvent } = await supabase
            .from('calendar_events')
            .select('id')
            .eq('outlook_id', outlookEvent.id)
            .single()

          if (!existingEvent) {
            const { data: newEvent } = await supabase
              .from('calendar_events')
              .insert({
                title: outlookEvent.subject,
                description: outlookEvent.body?.content,
                start_datetime: outlookEvent.start.dateTime,
                end_datetime: outlookEvent.end.dateTime,
                location: outlookEvent.location?.displayName,
                is_all_day: outlookEvent.isAllDay,
                outlook_id: outlookEvent.id,
                sync_status: 'synced',
                sync_with_outlook: true,
                created_by: userToken.user_id,
                org_id: org_id,
                attendees_emails: outlookEvent.attendees?.map((a: any) => a.emailAddress.address) || []
              })
              .select()
              .single()

            if (newEvent) {
              importedEvents.push(newEvent)
            }
          }
        }

        await logSyncAction('import', 'success', undefined, { imported_count: importedEvents.length })

        return new Response(
          JSON.stringify({ success: true, imported_count: importedEvents.length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error('Acción no válida')
    }

  } catch (error) {
    console.error('Error en sync-calendar:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
