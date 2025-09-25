import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendEmailRequest {
  user_id: string
  org_id: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body_html?: string
  body_text?: string
  attachments?: any[]
  reply_to_message_id?: string
  save_to_sent?: boolean
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

    const emailData: SendEmailRequest = await req.json()
    const { user_id, org_id, to, cc, bcc, subject, body_html, body_text, attachments, reply_to_message_id, save_to_sent = true } = emailData

    console.log(`Enviando email desde usuario: ${user_id} a: ${to.join(', ')}`)

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

    // Verificar expiración del token
    if (new Date(userToken.token_expires_at) <= new Date()) {
      console.log('Token expirado, renovando...')
      
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

      // Obtener token actualizado
      const { data: refreshedToken } = await supabase
        .from('user_outlook_tokens')
        .select('access_token_encrypted')
        .eq('user_id', user_id)
        .single()

      if (refreshedToken?.access_token_encrypted) {
        userToken.access_token_encrypted = refreshedToken.access_token_encrypted
      }
    }

    // 2. Construir mensaje para Microsoft Graph
    const messagePayload: any = {
      subject: subject,
      body: {
        contentType: body_html ? 'HTML' : 'Text',
        content: body_html || body_text || ''
      },
      toRecipients: to.map(email => ({
        emailAddress: { address: email }
      })),
      ccRecipients: cc?.map(email => ({
        emailAddress: { address: email }
      })) || [],
      bccRecipients: bcc?.map(email => ({
        emailAddress: { address: email }
      })) || [],
      importance: 'normal'
    }

    // 3. Manejar adjuntos si existen
    if (attachments && attachments.length > 0) {
      messagePayload.attachments = await processAttachments(attachments, supabase)
    }

    // 4. Determinar endpoint (envío o respuesta)
    let sendUrl = 'https://graph.microsoft.com/v1.0/me/sendMail'
    let method = 'POST'
    let requestBody: any = { message: messagePayload }

    if (reply_to_message_id) {
      // Es una respuesta
      sendUrl = `https://graph.microsoft.com/v1.0/me/messages/${reply_to_message_id}/reply`
      requestBody = {
        comment: body_text || '',
        message: messagePayload
      }
    }

    // 5. Enviar email a través de Microsoft Graph
    const sendResponse = await fetch(sendUrl, {
      method: method,
      headers: {
        'Authorization': `Bearer ${userToken.access_token_encrypted}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!sendResponse.ok) {
      const errorData = await sendResponse.json()
      console.error('Error enviando email:', errorData)
      throw new Error(`Error enviando email: ${errorData.error?.message || 'Error desconocido'}`)
    }

    // 6. Registrar email enviado en nuestra base de datos
    if (save_to_sent) {
      await saveEmailToDatabase(supabase, emailData, userToken.outlook_email, org_id)
    }

    // 7. Registrar actividad
    await logEmailActivity(supabase, user_id, org_id, {
      action: 'email_sent',
      recipients: to,
      subject: subject
    })

    console.log('Email enviado exitosamente')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email enviado correctamente',
        recipients: to.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en outlook-email-send:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function processAttachments(attachments: any[], supabase: any): Promise<any[]> {
  const processedAttachments = []

  for (const attachment of attachments) {
    if (attachment.file_path) {
      // Adjunto desde Supabase Storage
      const { data: fileData } = await supabase.storage
        .from('documents')
        .download(attachment.file_path)

      if (fileData) {
        const arrayBuffer = await fileData.arrayBuffer()
        const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

        processedAttachments.push({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: attachment.filename,
          contentType: attachment.content_type || 'application/octet-stream',
          contentBytes: base64Content,
          size: arrayBuffer.byteLength
        })
      }
    } else if (attachment.content_base64) {
      // Adjunto directo en base64
      processedAttachments.push({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: attachment.filename,
        contentType: attachment.content_type || 'application/octet-stream',
        contentBytes: attachment.content_base64,
        size: attachment.size || 0
      })
    }
  }

  return processedAttachments
}

async function saveEmailToDatabase(
  supabase: any, 
  emailData: SendEmailRequest, 
  fromEmail: string,
  org_id: string
) {
  // Buscar o crear thread basado en subject
  const { data: existingThread } = await supabase
    .from('email_threads')
    .select('id')
    .eq('subject', emailData.subject)
    .eq('org_id', org_id)
    .maybeSingle()

  let threadId = existingThread?.id

  if (!threadId) {
    const { data: newThread } = await supabase
      .from('email_threads')
      .insert({
        org_id,
        subject: emailData.subject,
        priority_level: 'normal'
      })
      .select('id')
      .single()
    
    threadId = newThread.id
  }

  // Guardar mensaje enviado
  const { data: emailMessage } = await supabase
    .from('email_messages')
    .insert({
      org_id,
      thread_id: threadId,
      subject: emailData.subject,
      body_html: emailData.body_html,
      body_text: emailData.body_text,
      from_address: fromEmail,
      to_addresses: emailData.to,
      cc_addresses: emailData.cc || [],
      bcc_addresses: emailData.bcc || [],
      sent_datetime: new Date().toISOString(),
      received_datetime: new Date().toISOString(),
      is_read: true,
      has_attachments: (emailData.attachments?.length || 0) > 0,
      message_type: 'sent',
      sync_status: 'synced',
      last_synced_at: new Date().toISOString()
    })
    .select('id')
    .single()

  // Guardar adjuntos si existen
  if (emailData.attachments && emailData.attachments.length > 0) {
    for (const attachment of emailData.attachments) {
      await supabase
        .from('email_attachments')
        .insert({
          org_id,
          message_id: emailMessage.id,
          filename: attachment.filename,
          content_type: attachment.content_type,
          file_size: attachment.size || 0,
          is_downloaded: true
        })
    }
  }

  // Actualizar thread
  await supabase
    .from('email_threads')
    .update({
      latest_message_id: emailMessage.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', threadId)
}

async function logEmailActivity(
  supabase: any, 
  user_id: string, 
  org_id: string, 
  activity: any
) {
  // Registrar en log de actividades (si existe tabla de actividades)
  console.log(`Actividad de email registrada para usuario ${user_id}:`, activity)
  
  // Aquí podrías insertar en una tabla de actividades si existe
  // await supabase.from('email_activities').insert({...})
}