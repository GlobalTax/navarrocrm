import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncRequest {
  user_id: string
  org_id: string
  full_sync?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, org_id, full_sync = false }: SyncRequest = await req.json()

    // Obtener configuración de Nylas para el usuario
    const { data: nylasConfig, error: configError } = await supabase
      .from('nylas_connections')
      .select('access_token, grant_id')
      .eq('user_id', user_id)
      .eq('org_id', org_id)
      .single()

    if (configError || !nylasConfig) {
      throw new Error('Usuario no tiene configuración de Nylas válida')
    }

    const nylasApiKey = Deno.env.get('NYLAS_API_KEY')
    if (!nylasApiKey) {
      throw new Error('NYLAS_API_KEY no configurado')
    }

    // Sincronizar mensajes
    const syncedCount = await syncMessages(
      nylasApiKey,
      nylasConfig.grant_id,
      supabase,
      org_id,
      user_id,
      full_sync
    )

    return new Response(
      JSON.stringify({
        success: true,
        synced_messages: syncedCount,
        message: `Sincronizados ${syncedCount} mensajes exitosamente`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error en sincronización de Nylas:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Error interno del servidor',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function syncMessages(
  apiKey: string,
  grantId: string,
  supabase: any,
  orgId: string,
  userId: string,
  fullSync: boolean
): Promise<number> {
  const baseUrl = 'https://api.us.nylas.com'
  let syncedCount = 0
  
  try {
    // Configurar parámetros de consulta
    const queryParams = new URLSearchParams({
      limit: '50',
      ...(fullSync ? {} : { received_after: await getLastSyncTimestamp(supabase, userId) })
    })

    // Obtener mensajes de Nylas
    const response = await fetch(`${baseUrl}/v3/grants/${grantId}/messages?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`Error de Nylas API: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const messages = data.data || []

    // Procesar cada mensaje
    for (const message of messages) {
      await processMessage(supabase, message, orgId, userId)
      syncedCount++
    }

    // Actualizar timestamp de última sincronización
    await updateLastSyncTimestamp(supabase, userId)

    return syncedCount

  } catch (error) {
    console.error('Error sincronizando mensajes:', error)
    throw error
  }
}

async function processMessage(supabase: any, message: any, orgId: string, userId: string) {
  try {
    // Verificar si el mensaje ya existe
    const { data: existing } = await supabase
      .from('email_messages')
      .select('id')
      .eq('message_id', message.id)
      .eq('org_id', orgId)
      .single()

    if (existing) {
      return // Mensaje ya existe
    }

    // Insertar mensaje
    const { error } = await supabase
      .from('email_messages')
      .insert({
        org_id: orgId,
        message_id: message.id,
        thread_id: message.thread_id,
        subject: message.subject || '',
        body: message.body || message.snippet || '',
        from_email: message.from?.[0]?.email || '',
        from_name: message.from?.[0]?.name || '',
        to_emails: message.to?.map((t: any) => t.email) || [],
        cc_emails: message.cc?.map((c: any) => c.email) || [],
        bcc_emails: message.bcc?.map((b: any) => b.email) || [],
        received_at: new Date(message.date * 1000).toISOString(),
        is_read: !message.unread,
        is_flagged: message.starred || false,
        folder_name: message.folders?.[0] || 'INBOX',
        sync_source: 'nylas'
      })

    if (error) {
      console.error('Error insertando mensaje:', error)
    }

  } catch (error) {
    console.error('Error procesando mensaje:', error)
    throw error
  }
}

async function getLastSyncTimestamp(supabase: any, userId: string): Promise<string> {
  const { data } = await supabase
    .from('nylas_sync_status')
    .select('last_sync_at')
    .eq('user_id', userId)
    .single()

  if (data?.last_sync_at) {
    return Math.floor(new Date(data.last_sync_at).getTime() / 1000).toString()
  }

  // Por defecto, sincronizar últimos 30 días
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  return Math.floor(thirtyDaysAgo.getTime() / 1000).toString()
}

async function updateLastSyncTimestamp(supabase: any, userId: string) {
  await supabase
    .from('nylas_sync_status')
    .upsert({
      user_id: userId,
      last_sync_at: new Date().toISOString(),
      status: 'completed'
    })
}