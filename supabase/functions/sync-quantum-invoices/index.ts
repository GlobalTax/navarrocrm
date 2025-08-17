import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { corsHeaders } from '../_shared/cors.ts'

interface SyncRequest {
  org_id: string
  start_date?: string
  end_date?: string
  invoice_type?: 'C' | 'P' | 'ALL'
  full?: boolean
  window_size?: number
  window_offset?: number
}

interface SyncResponse {
  success: boolean
  summary: {
    processed: number
    created: number
    updated: number
    skipped: number
    errors: number
  }
  window_info?: {
    current_window: number
    total_windows: number
    organizations_processed: string[]
  }
  details?: any[]
  error?: string
}

console.log('🚀 sync-quantum-invoices function initialized')

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    const body: SyncRequest = req.method === 'GET' 
      ? Object.fromEntries(new URL(req.url).searchParams.entries()) as any
      : await req.json()

    console.log('📥 [Request] Sync parameters:', body)

    // Determinar modo de operación
    const isCronJob = !body.org_id
    const isManualSync = !!body.org_id

    if (isCronJob) {
      console.log('🕒 [Cron] Executing scheduled sync for all organizations')
      return await handleScheduledSync(supabase, body)
    } else {
      console.log('🔧 [Manual] Executing manual sync for org:', body.org_id)
      return await handleManualSync(supabase, body)
    }

  } catch (error) {
    console.error('❌ [Error] Sync function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        summary: { processed: 0, created: 0, updated: 0, skipped: 0, errors: 1 }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleScheduledSync(supabase: any, params: SyncRequest): Promise<Response> {
  const windowSize = params.window_size || 5 // Organizaciones por ventana
  const windowOffset = params.window_offset || 0

  // Obtener lista de organizaciones activas
  const { data: orgs, error: orgsError } = await supabase
    .from('organizations')
    .select('id')
    .eq('is_active', true)
    .range(windowOffset * windowSize, (windowOffset + 1) * windowSize - 1)

  if (orgsError) {
    throw new Error(`Failed to fetch organizations: ${orgsError.message}`)
  }

  console.log(`🏢 [Cron] Processing window ${windowOffset + 1}, organizations: ${orgs?.length || 0}`)

  const results: SyncResponse[] = []
  const processedOrgs: string[] = []

  for (const org of orgs || []) {
    console.log(`🔄 [Cron] Syncing org ${org.id}`)
    
    try {
      const orgResult = await syncOrganizationInvoices(supabase, {
        ...params,
        org_id: org.id,
        start_date: params.start_date || getDefaultDateRange().start_date,
        end_date: params.end_date || getDefaultDateRange().end_date
      })
      
      results.push(orgResult)
      processedOrgs.push(org.id)
      
      // Pequeña pausa entre organizaciones
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`❌ [Cron] Error syncing org ${org.id}:`, error)
      results.push({
        success: false,
        summary: { processed: 0, created: 0, updated: 0, skipped: 0, errors: 1 },
        error: error.message
      })
    }
  }

  // Agregar resumen consolidado
  const consolidatedSummary = results.reduce((acc, result) => ({
    processed: acc.processed + result.summary.processed,
    created: acc.created + result.summary.created,
    updated: acc.updated + result.summary.updated,
    skipped: acc.skipped + result.summary.skipped,
    errors: acc.errors + result.summary.errors
  }), { processed: 0, created: 0, updated: 0, skipped: 0, errors: 0 })

  const response: SyncResponse = {
    success: results.every(r => r.success),
    summary: consolidatedSummary,
    window_info: {
      current_window: windowOffset + 1,
      total_windows: Math.ceil((orgs?.length || 0) / windowSize),
      organizations_processed: processedOrgs
    },
    details: results
  }

  console.log('✅ [Cron] Scheduled sync completed:', response.summary)

  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleManualSync(supabase: any, params: SyncRequest): Promise<Response> {
  const result = await syncOrganizationInvoices(supabase, params)

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function syncOrganizationInvoices(supabase: any, params: SyncRequest): Promise<SyncResponse> {
  console.log(`📊 [Sync] Starting sync for org ${params.org_id}`)
  
  // Obtener credenciales de Quantum para esta organización
  const quantumToken = Deno.env.get('QUANTUM_API_TOKEN')
  const quantumCompanyId = Deno.env.get('QUANTUM_COMPANY_ID')

  if (!quantumToken || !quantumCompanyId) {
    throw new Error('Quantum API credentials not configured')
  }

  const startDate = params.start_date || getDefaultDateRange().start_date
  const endDate = params.end_date || getDefaultDateRange().end_date
  const invoiceType = params.invoice_type || 'ALL'

  console.log(`📅 [Sync] Date range: ${startDate} to ${endDate}, type: ${invoiceType}`)

  // Construir URL de API de Quantum
  let apiUrl = `https://app.quantumeconomics.es/contabilidad/ws/invoice?companyId=${quantumCompanyId}`
  apiUrl += `&dateStart=${startDate}&dateEnd=${endDate}`
  
  if (invoiceType !== 'ALL') {
    apiUrl += `&invoiceType=${invoiceType}`
  }

  console.log(`🌐 [API] Calling Quantum API: ${apiUrl}`)

  // Llamar a la API de Quantum
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `API-KEY ${quantumToken}`,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Quantum API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const invoices = data.invoices || []

  console.log(`📄 [API] Retrieved ${invoices.length} invoices from Quantum`)

  const summary = { processed: 0, created: 0, updated: 0, skipped: 0, errors: 0 }
  const details: any[] = []

  // Procesar cada factura
  for (const invoice of invoices) {
    summary.processed++
    
    try {
      // Verificar si la factura ya existe
      const { data: existing, error: findError } = await supabase
        .from('quantum_invoices')
        .select('id')
        .eq('org_id', params.org_id)
        .eq('quantum_invoice_id', invoice.id)
        .single()

      if (findError && findError.code !== 'PGRST116') {
        throw findError
      }

      // Intentar mapear cliente por quantum_customer_id o nombre
      let contactId = null
      if (invoice.customerId) {
        const { data: contact } = await supabase
          .from('contacts')
          .select('id')
          .eq('org_id', params.org_id)
          .eq('quantum_customer_id', invoice.customerId)
          .single()
        
        contactId = contact?.id || null
      }

      const invoiceData = {
        org_id: params.org_id,
        quantum_invoice_id: invoice.id,
        contact_id: contactId,
        quantum_customer_id: invoice.customerId || '',
        client_name: invoice.customerName || 'Cliente desconocido',
        series_and_number: invoice.seriesAndNumber || '',
        invoice_date: invoice.invoiceDate || new Date().toISOString().split('T')[0],
        total_amount_without_taxes: parseFloat(invoice.totalAmountWithoutTaxes || 0),
        total_amount: parseFloat(invoice.totalAmount || 0),
        invoice_lines: invoice.invoiceLines || [],
        quantum_data: invoice
      }

      if (existing) {
        // Actualizar factura existente
        const { error: updateError } = await supabase
          .from('quantum_invoices')
          .update(invoiceData)
          .eq('id', existing.id)

        if (updateError) {
          throw updateError
        }

        summary.updated++
        details.push({ action: 'updated', invoice_id: invoice.id, client: invoice.customerName })
      } else {
        // Crear nueva factura
        const { error: insertError } = await supabase
          .from('quantum_invoices')
          .insert(invoiceData)

        if (insertError) {
          throw insertError
        }

        summary.created++
        details.push({ action: 'created', invoice_id: invoice.id, client: invoice.customerName })
      }

    } catch (error) {
      console.error(`❌ [Error] Processing invoice ${invoice.id}:`, error)
      summary.errors++
      details.push({ action: 'error', invoice_id: invoice.id, error: error.message })
    }
  }

  // Registrar el historial de sincronización
  await supabase.from('quantum_sync_history').insert({
    sync_date: new Date().toISOString(),
    status: summary.errors === 0 ? 'success' : 'error',
    message: `Facturas procesadas: ${summary.processed}, creadas: ${summary.created}, actualizadas: ${summary.updated}`,
    records_processed: summary.processed,
    error_details: summary.errors > 0 ? { errors: details.filter(d => d.action === 'error'), summary } : null,
    request_id: crypto.randomUUID()
  })

  console.log(`✅ [Sync] Completed for org ${params.org_id}:`, summary)

  return {
    success: summary.errors === 0,
    summary,
    details: details.slice(0, 20) // Limitar detalles en respuesta
  }
}

function getDefaultDateRange() {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 90) // Últimos 90 días por defecto

  return {
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0]
  }
}