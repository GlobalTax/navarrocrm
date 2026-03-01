import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Normalization helpers ──
const normalizeText = (text: string): string => {
  if (!text) return ''
  return text.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '').replace(/\s+/g, ' ')
}

// ── Classification (aligned with src/lib/contactClassification.ts) ──
const COMPANY_SUFFIXES = [
  /\b(S\.?L\.?U?)\b/i, /\b(S\.?A\.?)\b/i, /\b(S\.?L\.?L\.?)\b/i,
  /\b(S\.?L\.?P\.?U?)\b/i, /\b(S\.?C\.?)\b/i, /\b(S\.?COOP)\b/i,
  /\b(LIMITED|LTD|GMBH|INC|CORP|LLC|PLC)\b/i, /\b(B\.?V\.?)\b/i,
  /\b(SAS|SRL)\b/i, /\bSCP\b/i, /\bCB\b/i,
]
const COMPANY_KEYWORDS = [
  /\b(SOCIEDAD|FUNDACI[OÓ]N|ASOCIACI[OÓ]N|ASSOCIACI[OÓ]|COOPERATIVA)\b/i,
  /\b(COMMUNITY|GROUP|HOLDING|CAPITAL|CONSULTING|PARTNERS)\b/i,
  /\bCDAD\.?\s*DE\s*PROP/i, /\b(MISIONERAS|MONASTERIO|CLARISAS)\b/i,
  /\b(ABOGADOS|HOTELES?|HOSPEDERA|MARKETING|PATRIMONIAL)\b/i,
  /\b(INMOBILIARIA|CONSTRUCCI[OÓ]N|TRANSPORTES?|COMERCIAL)\b/i,
  /\b(DISTRIBUIDORA|INSTALACIONES|EL[EÉ]CTRICAS?|SERVICIOS)\b/i,
  /\b(PROMOTORA|INVERSIONES|GESTI[OÓ]N|ASESOR[IÍ]A|CONSULTOR[IÍ]A)\b/i,
  /\b(HOSTELERA|ALIMENTACI[OÓ]N|FARMAC[IÍ]A|CL[IÍ]NICA)\b/i,
  /\bFUNDACIO\b/i, /\bINDUST\b\.?/i, /\bINST\b\.?/i,
]
const NIF_EMPRESA_REGEX = /^[A-HJ-NP-SUVW]/
const JUNK_PATTERNS = [
  /\.{3,}/, /\bNO\s+USAR\b/i, /\bCLIENTES\s+(VARIOS|DUDOSO)\b/i,
  /\bDEUDORES\b/i, /\bREGISTRO\s+MERCANTIL\b/i, /\bFACT\.?\s*PEND/i,
]

interface ClassificationResult {
  looksLikeCompany: boolean; confidence: number; isJunk: boolean;
}

function detectCompanyPattern(name: string, nif?: string): ClassificationResult {
  if (!name) return { looksLikeCompany: false, confidence: 0, isJunk: false }
  const trimmed = name.trim()
  let confidence = 0
  let isJunk = false

  for (const r of JUNK_PATTERNS) { if (r.test(trimmed)) { isJunk = true; break } }
  for (const r of COMPANY_SUFFIXES) { if (r.test(trimmed)) { confidence = Math.max(confidence, 0.95); break } }
  for (const r of COMPANY_KEYWORDS) { if (r.test(trimmed)) { confidence = Math.max(confidence, 0.85); break } }
  if (nif && NIF_EMPRESA_REGEX.test(nif.trim())) confidence = Math.max(confidence, 0.85)

  return { looksLikeCompany: confidence >= 0.70, confidence, isJunk }
}

// ── Interfaces ──
interface QuantumCustomer {
  regid: string; nif: string; name: string; countryISO?: string;
  customerId: string; email?: string; phone?: string;
  streetType?: string; streetName?: string; streetNumber?: string;
  staircase?: string; floor?: string; room?: string;
  postCode?: string; cityCode?: string;
  [key: string]: any;
}
interface QuantumResponse {
  error?: { message: string; errorCode: string };
  apiVersion?: string; customers?: QuantumCustomer[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Automatic sync with resilient upsert ──
async function processAutomaticSync(supabase: any, customers: QuantumCustomer[], authMethod: string, endpoint: string) {
  console.log('🤖 Procesando sincronización automática con upsert resiliente...');

  const { data: orgs, error: orgsError } = await supabase
    .from('organizations').select('id').limit(1);
  if (orgsError || !orgs?.length) throw new Error('No se pudo obtener la organización');
  const orgId = orgs[0].id;

  // Build valid contacts
  const validContacts: any[] = [];
  let skipped = 0;
  const skipReasons: string[] = [];

  for (const customer of customers) {
    const cid = String(customer.customerId ?? '').trim();
    const name = (customer.name ?? '').trim();

    if (!cid || !name) {
      skipped++;
      skipReasons.push(`Sin ID/nombre: regid=${customer.regid}`);
      continue;
    }

    const cls = detectCompanyPattern(name, customer.nif);

    validContacts.push({
      org_id: orgId,
      name,
      email: customer.email || null,
      phone: customer.phone || null,
      dni_nif: customer.nif || null,
      address_street: [customer.streetType, customer.streetName, customer.streetNumber].filter(Boolean).join(' ') || null,
      address_postal_code: customer.postCode || null,
      client_type: cls.looksLikeCompany ? 'empresa' : 'particular',
      relationship_type: 'cliente',
      source: 'quantum_auto',
      auto_imported_at: new Date().toISOString(),
      quantum_customer_id: cid,
      status: cls.isJunk ? 'inactivo' : 'activo',
      updated_at: new Date().toISOString(),
    });
  }

  console.log(`📊 Válidos: ${validContacts.length}, omitidos: ${skipped}`);

  // Resilient batch upsert
  const BATCH_SIZE = 100;
  let upserted = 0;
  let errors = 0;
  const errorSamples: string[] = [];

  for (let i = 0; i < validContacts.length; i += BATCH_SIZE) {
    const batch = validContacts.slice(i, i + BATCH_SIZE);
    const { error: batchErr } = await supabase
      .from('contacts')
      .upsert(batch, { onConflict: 'org_id,quantum_customer_id', ignoreDuplicates: false });

    if (batchErr) {
      console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} falló: ${batchErr.message}. Fallback fila-a-fila...`);
      // Row-by-row fallback
      for (const row of batch) {
        const { error: rowErr } = await supabase
          .from('contacts')
          .upsert([row], { onConflict: 'org_id,quantum_customer_id', ignoreDuplicates: false });
        if (rowErr) {
          errors++;
          if (errorSamples.length < 20) errorSamples.push(`${row.name}: ${rowErr.message}`);
        } else {
          upserted++;
        }
      }
    } else {
      upserted += batch.length;
      console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} OK`);
    }
  }

  const finalStatus = errors === 0 ? 'success' : upserted > 0 ? 'partial' : 'error';
  const summaryMsg = `Sync: ${upserted} importados/actualizados, ${skipped} omitidos, ${errors} errores`;
  console.log(`🎉 ${summaryMsg}`);

  // Save notification
  const { error: notifErr } = await supabase.from('quantum_sync_notifications').insert({
    org_id: orgId,
    contacts_imported: upserted,
    contacts_skipped: skipped,
    status: finalStatus,
    error_message: errors > 0 ? `${errors} errores. Ejemplos: ${errorSamples.slice(0, 5).join(' | ')}` : null,
    sync_date: new Date().toISOString(),
  });
  if (notifErr) console.error('⚠️ Error guardando notificación:', notifErr.message);

  // Save history
  const { error: histErr } = await supabase.from('quantum_sync_history').insert({
    status: finalStatus,
    message: summaryMsg,
    records_processed: customers.length,
    sync_date: new Date().toISOString(),
  });
  if (histErr) console.error('⚠️ Error guardando historial:', histErr.message);

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        total_customers: customers.length,
        imported: upserted, skipped, errors,
        error_samples: errorSamples.slice(0, 10),
        authMethod, endpoint, auto_sync: true,
      },
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let autoSync = false;
    if (req.method === 'POST') {
      try { const body = await req.json(); autoSync = body.auto_sync === true; } catch (_) {}
    }

    console.log(autoSync ? '🤖 Sincronización automática' : '🚀 Obteniendo clientes de Quantum');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) throw new Error('Configuración de Supabase incompleta');

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const quantumToken = Deno.env.get('quantum_api_token');
    const companyId = Deno.env.get('quantum_company_id') || '28171';

    console.log('🔑 Verificando credenciales...');
    console.log('Token presente:', quantumToken ? 'SÍ' : 'NO');
    console.log('Company ID:', companyId ? `***${companyId.slice(-4)}` : 'NO CONFIGURADO');

    if (!quantumToken) {
      return new Response(JSON.stringify({ success: false, error: 'Token de Quantum no configurado.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const endpoint = `https://app.quantumeconomics.es/contabilidad/ws/customer?companyId=${companyId}`;
    console.log('📡 Llamando:', endpoint);

    let response: Response;
    let authMethod = '';
    try {
      response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${quantumToken}`, 'Accept': 'application/json' },
      });
      authMethod = 'Bearer';
      if (!response.ok) {
        response = await fetch(endpoint, {
          method: 'GET',
          headers: { 'Authorization': `API-KEY ${quantumToken}`, 'Accept': 'application/json' },
        });
        authMethod = 'API-KEY';
      }
      if (!response.ok) throw new Error(`API status: ${response.status}`);
    } catch (e) {
      throw new Error(`Error conectando con Quantum: ${e instanceof Error ? e.message : String(e)}`);
    }

    let data: QuantumResponse;
    try { data = await response.json(); } catch (_) {
      return new Response(JSON.stringify({ success: false, error: 'Respuesta no es JSON válido' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (data.error && data.error.errorCode && data.error.errorCode !== "0") {
      return new Response(JSON.stringify({ success: false, error: `Quantum: ${data.error.message}` }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const customers = data.customers;
    if (!customers || !Array.isArray(customers)) {
      return new Response(JSON.stringify({ success: false, error: 'No customers en respuesta' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📋 ${customers.length} customers obtenidos`);

    if (autoSync) {
      try {
        return await processAutomaticSync(supabase, customers, authMethod, endpoint);
      } catch (syncError) {
        console.error('❌ Error en sync automática:', syncError);
        // Register error notification
        try {
          const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
          if (orgs?.length) {
            await supabase.from('quantum_sync_notifications').insert({
              org_id: orgs[0].id, contacts_imported: 0, contacts_skipped: 0,
              status: 'error',
              error_message: syncError instanceof Error ? syncError.message : String(syncError),
              sync_date: new Date().toISOString(),
            });
          }
        } catch (_) {}
        return new Response(JSON.stringify({ success: false, error: syncError instanceof Error ? syncError.message : String(syncError) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Manual fetch – just return customers
    try {
      await supabase.from('quantum_sync_history').insert({
        status: 'success', message: `Obtenidos ${customers.length} customers`,
        records_processed: customers.length, sync_date: new Date().toISOString(),
      });
    } catch (_) {}

    return new Response(
      JSON.stringify({ success: true, data: { customers, total: customers.length, authMethod, endpoint } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error general:', error);
    try {
      const sb = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
      await sb.from('quantum_sync_history').insert({
        status: 'error', message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        records_processed: 0, sync_date: new Date().toISOString(),
      });
    } catch (_) {}

    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Error interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
