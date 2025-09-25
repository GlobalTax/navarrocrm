import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncRequest {
  user_id: string
  org_id: string
  folder_id?: string
  full_sync?: boolean
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

    const { user_id, org_id, folder_id, full_sync = false }: SyncRequest = await req.json()

    console.log(`Iniciando sincronización de emails para usuario: ${user_id}`)

    // 1. Obtener token válido del usuario
    const { data: userToken } = await supabase
      .from('user_outlook_tokens')
      .select('*')
      .eq('user_id', user_id)
      .eq('org_id', org_id)
      .eq('is_active', true)
      .single()

    if (!userToken) {
      throw new Error('Token de Outlook no encontrado o inactivo')
    }

    // Verificar si el token ha expirado
    if (new Date(userToken.token_expires_at) <= new Date()) {
      console.log('Token expirado, renovando...')
      
      // Llamar a outlook-auth para renovation
      const refreshResponse = await supabase.functions.invoke('outlook-auth', {
        body: {
          action: 'refresh_token',
          refresh_token: userToken.refresh_token_encrypted,
          org_id: org_id
        }
      })

      if (refreshResponse.error) {
        throw new Error('Error renovando token')
      }

      // Obtener el token actualizado
      const { data: refreshedToken } = await supabase
        .from('user_outlook_tokens')
        .select('access_token_encrypted')
        .eq('user_id', user_id)
        .single()

      if (refreshedToken?.access_token_encrypted) {
        userToken.access_token_encrypted = refreshedToken.access_token_encrypted
      }
    }

    // 2. Descifrar token de acceso
    const accessToken = atob(userToken.access_token_encrypted)
    console.log('🔑 Token descifrado exitosamente')

    // 3. Obtener carpetas si no están sincronizadas
    await syncFolders(supabase, accessToken, org_id, user_id)

    // 4. Determinar qué carpetas sincronizar
    const { data: foldersToSync } = await supabase
      .from('email_folders')
      .select('*')
      .eq('org_id', org_id)
      .eq('user_id', user_id)
      .eq('sync_enabled', true)

    if (!foldersToSync || foldersToSync.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No hay carpetas configuradas para sincronización' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let totalSynced = 0

    // 5. Sincronizar cada carpeta
    for (const folder of foldersToSync) {
      if (folder_id && folder.id !== folder_id) continue

      console.log(`Sincronizando carpeta: ${folder.folder_name}`)
      
      const synced = await syncFolderMessages(
        supabase, 
        accessToken, 
        folder, 
        org_id, 
        full_sync
      )
      
      totalSynced += synced
    }

    console.log(`Sincronización completada. ${totalSynced} mensajes procesados`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced_messages: totalSynced,
        folders_processed: foldersToSync.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en outlook-email-sync:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function syncFolders(supabase: any, accessToken: string, org_id: string, user_id: string) {
  const foldersUrl = 'https://graph.microsoft.com/v1.0/me/mailFolders'
  
  const foldersResponse = await fetch(foldersUrl, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  })

  const foldersData = await foldersResponse.json()

  if (!foldersData.value) return

  for (const folder of foldersData.value) {
    await supabase
      .from('email_folders')
      .upsert({
        org_id,
        user_id,
        outlook_id: folder.id,
        folder_name: folder.displayName,
        parent_folder_id: folder.parentFolderId,
        folder_type: getFolderType(folder.displayName),
        message_count: folder.totalItemCount || 0,
        sync_enabled: ['Inbox', 'Sent Items', 'Drafts'].includes(folder.displayName)
      })
  }
}

async function syncFolderMessages(
  supabase: any, 
  accessToken: string, 
  folder: any, 
  org_id: string, 
  full_sync: boolean
) {
  let syncedCount = 0
  let nextLink = null
  
  // Construir URL base
  let messagesUrl = `https://graph.microsoft.com/v1.0/me/mailFolders/${folder.outlook_id}/messages`
  
  // Si no es sincronización completa, aplicar filtro de fecha
  if (!full_sync) {
    const lastSync = await getLastSyncDate(supabase, folder.id)
    if (lastSync) {
      const filterDate = new Date(lastSync).toISOString()
      messagesUrl += `?$filter=receivedDateTime gt ${filterDate}`
    }
  }
  
  messagesUrl += (messagesUrl.includes('?') ? '&' : '?') + '$top=50&$expand=attachments'

  do {
    const url: string = nextLink || messagesUrl
    
    const response: Response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })

    const data: any = await response.json()

    if (!data.value) break

    // Procesar mensajes en lotes
    for (const message of data.value) {
      await processMessage(supabase, message, folder, org_id)
      syncedCount++
    }

    nextLink = data['@odata.nextLink']
    
    // Actualizar estado de sincronización
    await updateSyncStatus(supabase, folder.id, syncedCount, 'syncing')
    
  } while (nextLink)

  // Marcar sincronización como completada
  await updateSyncStatus(supabase, folder.id, syncedCount, 'completed')

  return syncedCount
}

async function processMessage(supabase: any, message: any, folder: any, org_id: string) {
  // Buscar o crear thread
  const { data: existingThread } = await supabase
    .from('email_threads')
    .select('id')
    .eq('subject', message.subject)
    .eq('org_id', org_id)
    .maybeSingle()

  let threadId = existingThread?.id

  if (!threadId) {
    const { data: newThread } = await supabase
      .from('email_threads')
      .insert({
        org_id,
        subject: message.subject,
        folder_id: folder.id,
        priority_level: message.importance || 'normal'
      })
      .select('id')
      .single()
    
    threadId = newThread.id
  }

  // Insertar mensaje
  const { data: emailMessage } = await supabase
    .from('email_messages')
    .upsert({
      org_id,
      thread_id: threadId,
      outlook_id: message.id,
      subject: message.subject,
      body_html: message.body?.content,
      body_text: message.bodyPreview,
      from_address: message.from?.emailAddress?.address,
      to_addresses: message.toRecipients?.map((r: any) => r.emailAddress.address) || [],
      cc_addresses: message.ccRecipients?.map((r: any) => r.emailAddress.address) || [],
      bcc_addresses: message.bccRecipients?.map((r: any) => r.emailAddress.address) || [],
      sent_datetime: message.sentDateTime,
      received_datetime: message.receivedDateTime,
      is_read: message.isRead,
      is_flagged: message.flag?.flagStatus === 'flagged',
      has_attachments: message.hasAttachments,
      message_type: message.isDraft ? 'draft' : 'received',
      sync_status: 'synced',
      last_synced_at: new Date().toISOString()
    })
    .select('id')
    .single()

  // Procesar adjuntos si existen
  if (message.hasAttachments && message.attachments) {
    for (const attachment of message.attachments) {
      await supabase
        .from('email_attachments')
        .upsert({
          org_id,
          message_id: emailMessage.id,
          outlook_id: attachment.id,
          filename: attachment.name,
          content_type: attachment.contentType,
          file_size: attachment.size,
          is_downloaded: false
        })
    }
  }

  // Actualizar thread con último mensaje
  await supabase
    .from('email_threads')
    .update({
      latest_message_id: emailMessage.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', threadId)
}

function getFolderType(folderName: string): string {
  const typeMap: Record<string, string> = {
    'Inbox': 'inbox',
    'Sent Items': 'sent',
    'Drafts': 'drafts',
    'Deleted Items': 'deleted'
  }
  
  return typeMap[folderName] || 'custom'
}

async function getLastSyncDate(supabase: any, folderId: string): Promise<string | null> {
  const { data } = await supabase
    .from('email_sync_status')
    .select('last_sync_datetime')
    .eq('folder_id', folderId)
    .maybeSingle()

  return data?.last_sync_datetime || null
}

async function updateSyncStatus(supabase: any, folderId: string, syncedCount: number, status: string) {
  await supabase
    .from('email_sync_status')
    .upsert({
      folder_id: folderId,
      last_sync_datetime: new Date().toISOString(),
      sync_status: status,
      synced_messages: syncedCount,
      updated_at: new Date().toISOString()
    })
}