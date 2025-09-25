
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Webhook para recibir notificaciones de cambios desde Outlook
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Validación de webhook de Microsoft (si se implementa)
    const validationToken = req.headers.get('ValidationToken')
    if (validationToken) {
      return new Response(validationToken, {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    const webhookData = await req.json()
    
    // Procesar notificaciones de cambios
    for (const notification of webhookData.value || []) {
      console.log('Webhook notification:', notification)
      
      // Procesar según el tipo de recurso
      if (notification.resource?.includes('/events/')) {
        // Cambio en calendario
        await handleCalendarChange(supabase, notification)
      } else if (notification.resource?.includes('/messages/')) {
        // Cambio en mensajes/emails
        await handleEmailChange(supabase, notification)
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en email-webhook:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleCalendarChange(supabase: any, notification: any) {
  try {
    // Extraer ID del evento de Outlook del recurso
    const resourceParts = notification.resource.split('/')
    const outlookEventId = resourceParts[resourceParts.length - 1]

    // Buscar el evento en nuestra base de datos
    const { data: event } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('outlook_id', outlookEventId)
      .single()

    if (event) {
      // Marcar como pendiente de sincronización
      await supabase
        .from('calendar_events')
        .update({ sync_status: 'pending_sync' })
        .eq('id', event.id)

      // Log del cambio detectado
      await supabase.from('calendar_sync_log').insert({
        org_id: event.org_id,
        user_id: event.created_by,
        event_id: event.id,
        sync_type: 'webhook',
        sync_direction: 'from_outlook',
        outlook_event_id: outlookEventId,
        sync_status: 'detected',
        sync_data: { notification_type: notification.changeType }
      })
    }
  } catch (error) {
    console.error('Error manejando cambio de calendario:', error)
  }
}

async function handleEmailChange(supabase: any, notification: any) {
  try {
    console.log('Cambio en email detectado:', notification)
    // Implementar lógica para cambios en emails si es necesario
  } catch (error) {
    console.error('Error manejando cambio de email:', error)
  }
}
