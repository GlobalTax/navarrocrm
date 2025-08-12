import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface QuantumInvoiceLine {
  description: string;
  quantity: string;
  amount: string;
  base: string;
  reference?: string;
  referenceType?: string;
}

interface QuantumInvoice {
  id: string;
  type: string;
  seriesAndNumber: string;
  invoiceDate: string;
  customerProviderId: string;
  name: string;
  totalAmountWithoutTaxes: string | number;
  totalAmount: string | number;
  line: QuantumInvoiceLine[];
}

interface QuantumResponse {
  error?: {
    message: string;
    errorCode: string;
  };
  invoices?: QuantumInvoice[];
  income?: string;
  expenses?: string;
  balance?: string;
  invoicesQuantity?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function mask(val?: string | null, last = 4) {
  if (!val) return '***';
  return `***${val.toString().slice(-last)}`;
}

function normalizeAmount(input: string | number | null | undefined): number {
  if (input === null || input === undefined) return 0;
  if (typeof input === 'number') return Number.isFinite(input) ? input : 0;
  const s = String(input).trim();
  if (!s) return 0;
  // Remove thousands dots and convert comma decimal to dot, strip non-numeric (except minus and dot)
  const cleaned = s
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

async function fetchWithRetry(url: string, token: string, maxRetries = 3, timeoutMs = 15000) {
  // Try both auth styles in each attempt
  const authStyles = [
    { name: 'API-KEY', header: `API-KEY ${token}` },
    { name: 'Bearer', header: `Bearer ${token}` },
  ];

  let lastError = '';
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const backoff = Math.pow(2, attempt) * 500; // 0.5s, 1s, 2s
    for (const style of authStyles) {
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const resp = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: style.header,
            Accept: 'application/json',
            'User-Agent': 'Supabase-Edge-Function/1.0',
          },
          signal: controller.signal,
        });
        clearTimeout(to);

        const contentType = resp.headers.get('content-type') || '';
        const text = await resp.text();
        const first200 = text.slice(0, 200);

        // Validate content-type and body not HTML
        if (!contentType.toLowerCase().includes('application/json') || first200.trim().startsWith('<')) {
          lastError = `Invalid content-type or HTML body: status=${resp.status}, ct=${contentType}, bodyStart=${first200}`;
        } else if (!resp.ok) {
          lastError = `HTTP ${resp.status} - ${first200}`;
        } else {
          // Parse JSON
          let data: QuantumResponse;
          try {
            data = JSON.parse(text);
          } catch (e) {
            lastError = `JSON parse error: ${(e as Error).message}`;
            continue;
          }
          return { data, authUsed: style.name, contentType };
        }
      } catch (e) {
        lastError = `Network/timeout error: ${(e as Error).message}`;
      } finally {
        clearTimeout(to);
      }
    }
    if (attempt < maxRetries - 1) {
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw new Error(lastError || 'Unknown error contacting Quantum');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Supabase service client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🧾 [Quantum Invoices Sync] Inicio');

    const quantumToken = Deno.env.get('quantum_api_token');
    const quantumCompanyId = Deno.env.get('quantum_company_id');

    console.log(`🏢 Company ID: ${mask(quantumCompanyId)}`);
    console.log(`🔑 Token: ${mask(quantumToken, 8)}`);

    if (!quantumToken || !quantumCompanyId) {
      const body = { 
        error: 'Credenciales de Quantum no configuradas',
        config_status: {
          token_configured: !!quantumToken,
          company_id_configured: !!quantumCompanyId,
        },
      };
      return new Response(JSON.stringify(body), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { org_id, start_date, end_date, periodDays, sync_type: syncTypeInput, invoice_type, page } = await req.json().catch(() => ({ })) as any;

    if (!org_id) {
      // Registrar en historial de errores por falta de org_id
      await supabase.from('quantum_invoice_sync_history').insert({
        org_id: '00000000-0000-0000-0000-000000000000',
        sync_status: 'error',
        sync_type: 'cron',
        start_date: start_date || null,
        end_date: end_date || null,
        invoices_processed: 0,
        invoices_created: 0,
        invoices_updated: 0,
        error_details: { reason: 'org_id requerido', hint: 'Proporcione org_id desde el cliente o cron multi-org' },
      } as any);
      return new Response(JSON.stringify({ error: 'org_id es requerido' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const syncType = syncTypeInput || (periodDays ? 'cron' : 'manual');

    // Fechas
    let start = start_date as string | undefined;
    let end = end_date as string | undefined;
    if (!start && !end && periodDays && typeof periodDays === 'number') {
      const now = new Date();
      const d = new Date(now);
      d.setDate(now.getDate() - periodDays);
      start = d.toISOString().slice(0, 10);
      end = now.toISOString().slice(0, 10);
    }

    const t = (invoice_type || 'C') as string;
    const p = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;

    let apiUrl = `https://app.quantumeconomics.es/contabilidad/ws/invoice?type=${encodeURIComponent(t)}&companyId=${encodeURIComponent(quantumCompanyId)}&page=${p}`;
    if (start) apiUrl += `&startDate=${encodeURIComponent(start)}`;
    if (end) apiUrl += `&endDate=${encodeURIComponent(end)}`;

    // Crear registro in_progress en el historial detallado
    let historyId: string | null = null;
    try {
      const { data: inProg } = await supabase
        .from('quantum_invoice_sync_history')
        .insert({
          org_id,
          sync_status: 'in_progress',
          sync_type: syncType,
          start_date: start || null,
          end_date: end || null,
          invoices_processed: 0,
          invoices_created: 0,
          invoices_updated: 0,
          error_details: { step: 'starting' },
        } as any)
        .select('id')
        .maybeSingle();
      historyId = inProg?.id ?? null;
    } catch (_e) {
      // no-op
    }

    console.log('🌐 [API] URL:', apiUrl.replace(quantumCompanyId, mask(quantumCompanyId)));

    let fetchResult;
    try {
      fetchResult = await fetchWithRetry(apiUrl, quantumToken, 3, 15000);
    } catch (err) {
      const details = { api_error: (err as Error).message, url: apiUrl, company_id_masked: mask(quantumCompanyId), tried: ['API-KEY', 'Bearer'] };
      // Backward-compatible log
      await supabase.from('quantum_sync_history').insert({
        status: 'error', message: 'Error autenticando/consultando Quantum Invoices', records_processed: 0,
        error_details: details, sync_date: new Date().toISOString(),
      } as any);
      // New history table: update in-progress if exists; otherwise insert
      if (historyId) {
        await supabase.from('quantum_invoice_sync_history').update({
          sync_status: 'error',
          invoices_processed: 0,
          invoices_created: 0,
          invoices_updated: 0,
          error_details: { ...details, auth_used: null },
        } as any).eq('id', historyId);
      } else {
        await supabase.from('quantum_invoice_sync_history').insert({
          org_id, sync_status: 'error', sync_type: syncType, start_date: start || null, end_date: end || null,
          invoices_processed: 0, invoices_created: 0, invoices_updated: 0,
          error_details: { ...details, auth_used: null },
        } as any);
      }
      return new Response(JSON.stringify({ error: 'Respuesta inválida de Quantum', details }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: quantumData, authUsed } = fetchResult as { data: QuantumResponse; authUsed: string };

    if (quantumData.error && quantumData.error.errorCode && quantumData.error.errorCode !== '0') {
      const details = { quantum_error: quantumData.error, auth_used: authUsed };
      await supabase.from('quantum_sync_history').insert({ status: 'error', message: 'Error en respuesta de Quantum Invoices', records_processed: 0, error_details: details, sync_date: new Date().toISOString() } as any);
      if (historyId) {
        await supabase.from('quantum_invoice_sync_history').update({
          sync_status: 'error',
          invoices_processed: 0,
          invoices_created: 0,
          invoices_updated: 0,
          error_details: details,
        } as any).eq('id', historyId);
      } else {
        await supabase.from('quantum_invoice_sync_history').insert({ org_id, sync_status: 'error', sync_type: syncType, start_date: start || null, end_date: end || null, invoices_processed: 0, invoices_created: 0, invoices_updated: 0, error_details: details } as any);
      }
      return new Response(JSON.stringify({ error: 'Error en respuesta de Quantum', details }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const invoices = quantumData.invoices || [];
    console.log(`📊 [Data] Facturas recibidas: ${invoices.length} (auth: ${authUsed})`);

    let processedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    const errors: any[] = [];

    for (const invoice of invoices) {
      try {
        processedCount++;

        const { data: contact } = await supabase
          .from('contacts')
          .select('id')
          .eq('quantum_customer_id', invoice.customerProviderId)
          .eq('org_id', org_id)
          .maybeSingle();

        const invoiceData = {
          quantum_invoice_id: invoice.id,
          org_id,
          contact_id: contact?.id || null,
          quantum_customer_id: invoice.customerProviderId,
          client_name: invoice.name,
          series_and_number: invoice.seriesAndNumber,
          invoice_date: invoice.invoiceDate,
          total_amount_without_taxes: normalizeAmount(invoice.totalAmountWithoutTaxes),
          total_amount: normalizeAmount(invoice.totalAmount),
          invoice_lines: invoice.line || [],
          quantum_data: invoice,
        } as any;

        const { data: existing } = await supabase
          .from('quantum_invoices')
          .select('id')
          .eq('quantum_invoice_id', invoice.id)
          .eq('org_id', org_id)
          .maybeSingle();

        if (existing?.id) {
          const { error: ue } = await supabase.from('quantum_invoices').update(invoiceData).eq('id', existing.id);
          if (ue) {
            errors.push({ invoice_id: invoice.id, error: ue.message });
          } else {
            updatedCount++;
          }
        } else {
          const { error: ie } = await supabase.from('quantum_invoices').insert(invoiceData);
          if (ie) {
            errors.push({ invoice_id: invoice.id, error: ie.message });
          } else {
            createdCount++;
          }
        }
      } catch (e) {
        errors.push({ invoice_id: invoice.id, error: (e as Error).message });
      }
    }

    const finalStatus = errors.length === 0 ? 'success' : 'error';

    // Backward-compatible history
    await supabase.from('quantum_sync_history').insert({
      status: finalStatus,
      message: finalStatus === 'success' ? 'Facturas sincronizadas correctamente' : 'Sincronización de facturas con errores',
      records_processed: processedCount,
      error_details: errors.length ? { errors, auth_used: authUsed } : { auth_used: authUsed },
      sync_date: new Date().toISOString(),
    } as any);

    // New detailed history: finalize in-progress if possible
    if (historyId) {
      await supabase.from('quantum_invoice_sync_history').update({
        sync_status: finalStatus,
        invoices_processed: processedCount,
        invoices_created: createdCount,
        invoices_updated: updatedCount,
        error_details: errors.length ? { errors, auth_used: authUsed } : { auth_used: authUsed },
      } as any).eq('id', historyId);
    } else {
      await supabase.from('quantum_invoice_sync_history').insert({
        org_id,
        sync_status: finalStatus,
        sync_type: syncType,
        start_date: start || null,
        end_date: end || null,
        invoices_processed: processedCount,
        invoices_created: createdCount,
        invoices_updated: updatedCount,
        error_details: errors.length ? { errors, auth_used: authUsed } : { auth_used: authUsed },
      } as any);
    }

    console.log(`✅ [Done] creadas=${createdCount}, actualizadas=${updatedCount}, errores=${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sincronización completada',
        summary: { processed: processedCount, created: createdCount, updated: updatedCount, errors: errors.length, auth_used: authUsed },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ [General] Error:', (error as Error).message);
    return new Response(JSON.stringify({ error: 'Error interno del servidor', details: (error as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
