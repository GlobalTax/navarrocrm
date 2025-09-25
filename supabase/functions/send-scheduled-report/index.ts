
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "https://esm.sh/resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReportData {
  total_cases?: number
  active_cases?: number
  total_contacts?: number
  billable_hours?: number
  revenue?: number
  total_hours?: number
  utilization_rate?: number
  won_proposals?: number
  [key: string]: any
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
    const body = await req.json()
    
    // Si es una solicitud para procesar todos los reportes programados
    if (body.check_scheduled_reports) {
      return await processAllScheduledReports()
    }
    
    // Si es una solicitud para un reporte específico
    if (body.reportId) {
      return await sendSpecificReport(body.reportId)
    }

    throw new Error('Solicitud inválida')

  } catch (error: any) {
    console.error('Error en send-scheduled-report:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function processAllScheduledReports() {
  // Obtener reportes que necesitan ser enviados
  const { data: reports, error } = await supabase
    .from('scheduled_reports')
    .select('*')
    .eq('is_enabled', true)
    .lte('next_send_date', new Date().toISOString())

  if (error) {
    throw new Error(`Error obteniendo reportes: ${error.message}`)
  }

  if (!reports || reports.length === 0) {
    return new Response(JSON.stringify({ message: 'No hay reportes para enviar' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  let sentCount = 0
  for (const report of reports) {
    try {
      await sendReportEmail(report)
      await updateNextSendDate(report.id, report.frequency)
      sentCount++
    } catch (error) {
      console.error(`Error enviando reporte ${report.id}:`, error)
    }
  }

  return new Response(JSON.stringify({ 
    message: `Procesados ${sentCount} de ${reports.length} reportes` 
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function sendSpecificReport(reportId: string) {
  // Obtener configuración del reporte
  const { data: report, error: reportError } = await supabase
    .from('scheduled_reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (reportError || !report) {
    throw new Error('Reporte no encontrado')
  }

  await sendReportEmail(report)
  await updateNextSendDate(report.id, report.frequency)

  return new Response(JSON.stringify({ message: 'Reporte enviado exitosamente' }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function sendReportEmail(report: any) {
  // Generar datos del reporte
  const reportData = await generateReportData(report.org_id, report.report_type, report.metrics_included)

  // Generar HTML del reporte
  const htmlContent = generateReportHTML(report, reportData)

  // Enviar email a cada destinatario
  for (const email of report.email_recipients) {
    await resend.emails.send({
      from: 'Reportes CRM <noreply@tudominio.com>',
      to: [email],
      subject: `📊 ${report.report_name} - ${new Date().toLocaleDateString('es-ES')}`,
      html: htmlContent
    })
  }
}

async function updateNextSendDate(reportId: string, frequency: string) {
  const nextDate = calculateNextSendDate(frequency)
  await supabase
    .from('scheduled_reports')
    .update({ next_send_date: nextDate })
    .eq('id', reportId)
}

async function generateReportData(orgId: string, reportType: string, metrics: string[]): Promise<ReportData> {
  const data: ReportData = {}

  try {
    // Obtener estadísticas del dashboard
    if (reportType === 'dashboard' || metrics.includes('total_cases')) {
      const { data: dashboardStats } = await supabase.rpc('get_dashboard_stats', { 
        org_id_param: orgId 
      })
      
      if (dashboardStats) {
        data.total_cases = dashboardStats.totalCases
        data.active_cases = dashboardStats.activeCases
        data.total_contacts = dashboardStats.totalContacts
        data.billable_hours = dashboardStats.totalBillableHours
      }
    }

    // Obtener métricas de tiempo si es necesario
    if (reportType === 'time_tracking') {
      const { data: timeStats } = await supabase
        .from('time_entries')
        .select('duration_minutes, is_billable')
        .eq('org_id', orgId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      if (timeStats) {
        data.total_hours = timeStats.reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)
        data.billable_hours = timeStats
          .filter(entry => entry.is_billable)
          .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)
        data.utilization_rate = data.total_hours > 0 ? (data.billable_hours / data.total_hours) * 100 : 0
      }
    }

    // Obtener métricas financieras
    if (reportType === 'financial') {
      const { data: proposals } = await supabase
        .from('proposals')
        .select('total_amount, status')
        .eq('org_id', orgId)
        .eq('status', 'won')
        .gte('accepted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      if (proposals) {
        data.revenue = proposals.reduce((sum, proposal) => sum + (proposal.total_amount || 0), 0)
        data.won_proposals = proposals.length
      }
    }

  } catch (error) {
    console.error('Error generando datos del reporte:', error)
  }

  return data
}

function generateReportHTML(report: any, data: ReportData): string {
  const formatNumber = (num: number) => new Intl.NumberFormat('es-ES').format(Math.round(num))
  const formatCurrency = (num: number) => new Intl.NumberFormat('es-ES', { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(num)

  return `
    <div style="font-family: 'Manrope', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 0.5px solid black; border-radius: 10px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">📊 ${report.report_name}</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">
          ${new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px;">
        <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 20px; border: 0.5px solid black;">
          <h2 style="color: #333; margin-top: 0;">📈 Métricas Principales</h2>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
            ${data.total_cases !== undefined ? `
              <div style="text-align: center; padding: 15px; background: #e3f2fd; border-radius: 10px; border: 0.5px solid black;">
                <div style="font-size: 24px; font-weight: bold; color: #1976d2;">${formatNumber(data.total_cases)}</div>
                <div style="color: #666; font-size: 14px;">Casos Totales</div>
              </div>
            ` : ''}
            
            ${data.active_cases !== undefined ? `
              <div style="text-align: center; padding: 15px; background: #e8f5e8; border-radius: 10px; border: 0.5px solid black;">
                <div style="font-size: 24px; font-weight: bold; color: #388e3c;">${formatNumber(data.active_cases)}</div>
                <div style="color: #666; font-size: 14px;">Casos Activos</div>
              </div>
            ` : ''}
            
            ${data.billable_hours !== undefined ? `
              <div style="text-align: center; padding: 15px; background: #fff3e0; border-radius: 10px; border: 0.5px solid black;">
                <div style="font-size: 24px; font-weight: bold; color: #f57c00;">${formatNumber(data.billable_hours)}h</div>
                <div style="color: #666; font-size: 14px;">Horas Facturables</div>
              </div>
            ` : ''}
            
            ${data.revenue !== undefined ? `
              <div style="text-align: center; padding: 15px; background: #f3e5f5; border-radius: 10px; border: 0.5px solid black;">
                <div style="font-size: 24px; font-weight: bold; color: #7b1fa2;">${formatCurrency(data.revenue)}</div>
                <div style="color: #666; font-size: 14px;">Ingresos</div>
              </div>
            ` : ''}
          </div>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 10px; border: 0.5px solid black;">
          <h3 style="color: #333; margin-top: 0;">ℹ️ Información del Reporte</h3>
          <div style="color: #666; font-size: 14px; line-height: 1.6;">
            <p><strong>Tipo:</strong> ${report.report_type.replace('_', ' ')}</p>
            <p><strong>Frecuencia:</strong> ${report.frequency === 'daily' ? 'Diario' : report.frequency === 'weekly' ? 'Semanal' : 'Mensual'}</p>
            <p><strong>Próximo reporte:</strong> ${new Date(report.next_send_date).toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      </div>
      
      <div style="background: #263238; padding: 20px; text-align: center;">
        <p style="color: #90a4ae; margin: 0; font-size: 12px;">
          Este es un reporte automático generado por tu sistema CRM.<br>
          Para modificar la configuración, accede al panel de administración.
        </p>
      </div>
    </div>
  `
}

function calculateNextSendDate(frequency: string): string {
  const now = new Date()
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1)
      break
    case 'weekly':
      now.setDate(now.getDate() + 7)
      break
    case 'monthly':
      now.setMonth(now.getMonth() + 1)
      break
  }
  return now.toISOString()
}
