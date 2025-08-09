import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function mask(val?: string | null, last = 4) {
  if (!val) return '***';
  return `***${val.toString().slice(-last)}`;
}

async function tryAuth(url: string, header: string, timeoutMs = 10000) {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: header, Accept: 'application/json', 'User-Agent': 'Supabase-Edge-Function/1.0' },
      signal: controller.signal,
    });
    const contentType = res.headers.get('content-type') || '';
    const body = await res.text();
    const first200Chars = body.slice(0, 200);
    return { ok: res.ok, status: res.status, contentType, first200Chars };
  } catch (e) {
    return { ok: false, status: 0, contentType: '', first200Chars: `error: ${(e as Error).message}` };
  } finally {
    clearTimeout(to);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint = 'invoice', start_date, end_date } = await req.json().catch(() => ({ })) as any;

    const token = Deno.env.get('quantum_api_token');
    const companyId = Deno.env.get('quantum_company_id');

    if (!token || !companyId) {
      return new Response(JSON.stringify({
        error: 'Faltan secretos',
        config_status: { token_configured: !!token, company_id_configured: !!companyId },
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let base = endpoint === 'customers'
      ? `https://app.quantumeconomics.es/contabilidad/ws/customers?companyId=${encodeURIComponent(companyId)}`
      : `https://app.quantumeconomics.es/contabilidad/ws/invoice?type=C&companyId=${encodeURIComponent(companyId)}`;

    if (start_date) base += `&startDate=${encodeURIComponent(start_date)}`;
    if (end_date) base += `&endDate=${encodeURIComponent(end_date)}`;

    const bearer = await tryAuth(base, `Bearer ${token}`);
    const apiKey = await tryAuth(base, `API-KEY ${token}`);

    return new Response(JSON.stringify({
      url_masked: base.replace(companyId, mask(companyId)),
      results: {
        bearer,
        apiKey,
      }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
