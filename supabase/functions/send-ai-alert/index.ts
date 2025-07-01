
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AlertRequest {
  org_id: string
  alert_type: 'high_cost' | 'high_failures' | 'unusual_pattern'
  message: string
  severity: 'low' | 'medium' | 'high'
  data: any
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { org_id, alert_type, message, severity, data }: AlertRequest = await req.json()

    // Obtener configuraciones de alerta para la organización
    const { data: configs, error: configError } = await supabase
      .from('ai_notification_configs')
      .select('*')
      .eq('org_id', org_id)
      .eq('is_enabled', true)

    if (configError) {
      throw new Error(`Error fetching notification configs: ${configError.message}`)
    }

    if (!configs || configs.length === 0) {
      return new Response(JSON.stringify({ message: 'No notification configs found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Determinar si debe enviar alerta basado en umbrales
    for (const config of configs) {
      let shouldAlert = false

      if (alert_type === 'high_cost' && data.cost > config.threshold_cost) {
        shouldAlert = true
      } else if (alert_type === 'high_failures' && data.failure_rate > config.threshold_failures) {
        shouldAlert = true
      } else if (alert_type === 'unusual_pattern') {
        shouldAlert = true // Siempre alertar sobre patrones inusuales
      }

      if (!shouldAlert) continue

      // Enviar email si está configurado
      if ((config.notification_type === 'email' || config.notification_type === 'both') && config.email_address) {
        const emailSubject = `🤖 Alerta IA - ${getSeverityEmoji(severity)} ${alert_type.replace('_', ' ').toUpperCase()}`
        
        const emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">
                ${getSeverityEmoji(severity)} Alerta del Sistema IA
              </h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${getSeverityColor(severity)};">
                <h2 style="color: #333; margin-top: 0;">${message}</h2>
                
                <div style="margin: 20px 0;">
                  <strong>Tipo de alerta:</strong> ${alert_type.replace('_', ' ')}<br>
                  <strong>Severidad:</strong> ${severity.toUpperCase()}<br>
                  <strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}
                </div>

                ${data.cost ? `<p><strong>Costo detectado:</strong> €${data.cost.toFixed(2)}</p>` : ''}
                ${data.failure_rate ? `<p><strong>Tasa de fallos:</strong> ${data.failure_rate.toFixed(1)}%</p>` : ''}
                ${data.calls ? `<p><strong>Llamadas inusuales:</strong> ${data.calls}</p>` : ''}
                
                <div style="margin-top: 30px; padding: 15px; background: #e3f2fd; border-radius: 4px;">
                  <p style="margin: 0; font-size: 14px; color: #666;">
                    <strong>Recomendación:</strong> Revisa el panel de administración IA para más detalles y tomar acciones correctivas si es necesario.
                  </p>
                </div>
              </div>
            </div>
          </div>
        `

        await resend.emails.send({
          from: 'Sistema CRM <noreply@tudominio.com>',
          to: [config.email_address],
          subject: emailSubject,
          html: emailBody
        })
      }

      // Crear notificación en dashboard si está configurado
      if (config.notification_type === 'dashboard' || config.notification_type === 'both') {
        await supabase
          .from('ai_alert_notifications')
          .insert({
            org_id,
            user_id: config.user_id,
            alert_type,
            message,
            severity,
            alert_data: data,
            is_read: false
          })
      }
    }

    return new Response(JSON.stringify({ message: 'Alerts sent successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('Error sending AI alert:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function getSeverityEmoji(severity: string): string {
  switch (severity) {
    case 'high': return '🚨'
    case 'medium': return '⚠️'
    case 'low': return '⚡'
    default: return '📊'
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'high': return '#ef4444'
    case 'medium': return '#f59e0b'
    case 'low': return '#3b82f6'
    default: return '#6b7280'
  }
}
