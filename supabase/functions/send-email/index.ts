
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendEmailRequest {
  template_id?: string
  template_type?: 'invitation' | 'reminder' | 'followup' | 'custom'
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject?: string
  body?: string
  variables?: Record<string, string>
  event_id?: string
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

    const {
      template_id,
      template_type,
      to,
      cc,
      bcc,
      subject,
      body,
      variables = {},
      event_id,
      org_id
    }: SendEmailRequest = await req.json()

    // Obtener token del usuario
    const { data: userToken } = await supabase
      .from('user_outlook_tokens')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('org_id', org_id)
      .eq('is_active', true)
      .single()

    if (!userToken) {
      throw new Error('Token de Outlook no encontrado')
    }

    const accessToken = userToken.access_token_encrypted // Descifrar en producción

    let emailSubject = subject
    let emailBody = body

    // Si se especifica una plantilla, obtenerla y procesarla
    if (template_id || template_type) {
      let query = supabase
        .from('email_templates')
        .select('*')
        .eq('org_id', org_id)
        .eq('is_active', true)

      if (template_id) {
        query = query.eq('id', template_id)
      } else if (template_type) {
        query = query.eq('template_type', template_type)
      }

      const { data: template } = await query.single()

      if (!template) {
        throw new Error('Plantilla de email no encontrada')
      }

      // Procesar variables en la plantilla
      emailSubject = template.subject_template
      emailBody = template.body_template

      // Reemplazar variables en subject y body
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`
        emailSubject = emailSubject.replace(new RegExp(placeholder, 'g'), value)
        emailBody = emailBody.replace(new RegExp(placeholder, 'g'), value)
      }
    }

    // Si hay un event_id, obtener datos del evento para variables automáticas
    if (event_id && !template_id && !subject && !body) {
      const { data: event } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', event_id)
        .single()

      if (event) {
        const eventDate = new Date(event.start_datetime).toLocaleDateString('es-ES')
        const eventTime = new Date(event.start_datetime).toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })

        variables.event_title = event.title
        variables.event_date = eventDate
        variables.event_time = eventTime
        variables.event_location = event.location || 'Por definir'
        variables.event_description = event.description || ''
      }
    }

    // Crear el email para Outlook
    const outlookEmail = {
      message: {
        subject: emailSubject,
        body: {
          contentType: "HTML",
          content: emailBody
        },
        toRecipients: to.map(email => ({
          emailAddress: { address: email }
        })),
        ccRecipients: cc?.map(email => ({
          emailAddress: { address: email }
        })) || [],
        bccRecipients: bcc?.map(email => ({
          emailAddress: { address: email }
        })) || []
      },
      saveToSentItems: true
    }

    // Enviar email a través de Microsoft Graph
    const sendResponse = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(outlookEmail)
    })

    if (!sendResponse.ok) {
      const error = await sendResponse.json()
      throw new Error(`Error enviando email: ${error.error?.message}`)
    }

    // Log del email enviado
    if (event_id) {
      // Actualizar último email enviado en casos relacionados
      const { data: event } = await supabase
        .from('calendar_events')
        .select('case_id')
        .eq('id', event_id)
        .single()

      if (event?.case_id) {
        await supabase
          .from('cases')
          .update({ last_email_sent_at: new Date().toISOString() })
          .eq('id', event.case_id)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        subject: emailSubject,
        recipients_count: to.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en send-email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
