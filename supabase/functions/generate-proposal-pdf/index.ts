import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface GenerateProposalPdfRequest {
  proposalId: string;
  totalAmount: number;
  currency?: string;
  lineItems: any[];
  style?: 'formal' | 'visual';
}

function generateFormalHtml(proposal: any, lineItems: any[], subtotal: number, taxAmount: number, total: number): string {
  const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const pricingData = proposal.pricing_tiers_data || {};
  const phases = pricingData.phases || [];
  const team = pricingData.team || [];
  const companyInfo = pricingData.companyInfo || {};
  const terms = pricingData.terms || {};

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Propuesta ${proposal.proposal_number}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; line-height: 1.6; color: #333; background: white; }
  .container { max-width: 800px; margin: 0 auto; padding: 50px 40px; }
  h1, h2, h3 { font-family: Arial, Helvetica, sans-serif; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
  .company-name { font-size: 20px; font-weight: bold; }
  .company-sub { font-size: 11px; color: #666; }
  .divider { border-bottom: 2px solid #000; margin: 15px 0 25px; }
  .main-title { text-align: center; font-size: 16px; font-weight: bold; letter-spacing: 0.05em; margin-bottom: 25px; }
  .meta { font-size: 13px; margin-bottom: 20px; }
  .meta p { margin-bottom: 3px; }
  .section { margin-bottom: 25px; }
  .section-title { font-size: 15px; font-weight: bold; margin-bottom: 10px; }
  .justify { text-align: justify; font-size: 13px; line-height: 1.7; }
  .phase { margin-left: 15px; margin-bottom: 15px; }
  .phase h3 { font-size: 13px; font-weight: bold; margin-bottom: 5px; }
  ul { margin-left: 20px; font-size: 13px; }
  li { margin-bottom: 3px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
  th { text-align: left; padding: 8px; border-bottom: 2px solid #000; }
  td { padding: 8px; border-bottom: 1px solid #ccc; }
  .text-right { text-align: right; }
  .total-row { font-weight: bold; border-top: 2px solid #000; }
  .acceptance { margin-top: 40px; border-top: 2px solid #000; padding-top: 25px; }
  .acceptance-title { text-align: center; font-weight: bold; font-size: 14px; margin-bottom: 20px; }
  .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
  .sig-block { text-align: center; width: 40%; }
  .sig-line { border-bottom: 1px solid #000; margin-top: 60px; margin-bottom: 5px; }
  .sig-label { font-size: 11px; color: #666; }
  .closing { text-align: center; margin-top: 30px; font-size: 13px; }
</style></head><body><div class="container">
  <div class="header">
    <div><div class="company-name">${companyInfo.name || 'Despacho Jurídico'}</div><div class="company-sub">Asesores Legales y Tributarios</div></div>
    <div style="font-size:13px;color:#666">Barcelona</div>
  </div>
  <div class="divider"></div>
  <div class="main-title">PROPUESTA DE HONORARIOS PROFESIONALES</div>
  <div class="meta">
    <p>En Barcelona, a ${today}</p>
    ${proposal.contact?.name ? `<p><strong>Re:</strong> ${proposal.contact.name}</p>` : ''}
    ${proposal.proposal_number ? `<p><strong>Ref.:</strong> <em>${proposal.title}</em></p>` : ''}
  </div>
  <p class="justify" style="margin-bottom:15px">Estimado/a Sr./Sra. ${proposal.contact?.name?.split(' ')[0] || 'Cliente'}:</p>
  <p class="justify" style="margin-bottom:20px">${proposal.introduction || proposal.description || 'Tenemos el gusto de remitirles la presente propuesta de servicios profesionales.'}</p>

  <div class="section">
    <div class="section-title">1. Información General sobre ${companyInfo.name || 'el Despacho'}</div>
    <p class="justify">${companyInfo.description || ''}</p>
  </div>

  <div class="section">
    <div class="section-title">2. Alcance de Nuestra Colaboración</div>
    ${phases.map((p: any, i: number) => `
      <div class="phase">
        <h3>Fase ${i+1} – ${p.name} ${p.estimatedDuration ? `(${p.estimatedDuration})` : ''}</h3>
        ${p.description ? `<p class="justify">${p.description}</p>` : ''}
        ${p.deliverables?.length ? `<p style="font-size:13px;font-weight:600;margin-top:5px">Entregables:</p><ul>${p.deliverables.map((d: string) => `<li>${d}</li>`).join('')}</ul>` : ''}
      </div>
    `).join('')}
  </div>

  ${team.length ? `<div class="section">
    <div class="section-title">3. Equipo Responsable</div>
    <ul>${team.map((m: any) => `<li><strong>${m.role}:</strong> ${m.name}${m.experience ? ` — ${m.experience}` : ''}</li>`).join('')}</ul>
  </div>` : ''}

  <div class="section">
    <div class="section-title">4. Honorarios Profesionales</div>
    <table>
      <thead><tr><th>Concepto</th><th>Descripción</th><th class="text-right">Importe</th></tr></thead>
      <tbody>
        ${lineItems.map(item => `<tr><td><strong>${item.name}</strong></td><td>${item.description || ''}</td><td class="text-right">${item.total_price?.toFixed(2)} €</td></tr>`).join('')}
        <tr class="total-row"><td colspan="2">SUBTOTAL</td><td class="text-right">${subtotal.toFixed(2)} €</td></tr>
        <tr><td colspan="2">IVA (21%)</td><td class="text-right">${taxAmount.toFixed(2)} €</td></tr>
        <tr class="total-row"><td colspan="2">TOTAL</td><td class="text-right">${total.toFixed(2)} €</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">5. Gastos y Suplidos</div>
    <p class="justify">${terms.expensesIncluded ? 'Los gastos y suplidos están incluidos en los honorarios.' : 'Los gastos y suplidos no están incluidos y correrán a cargo del cliente, previa justificación.'}</p>
  </div>

  ${terms.confidentialityClause !== false ? `<div class="section">
    <div class="section-title">6. Confidencialidad</div>
    <p class="justify">${companyInfo.name || 'El Despacho'} se compromete a mantener la más estricta confidencialidad sobre toda la información facilitada.</p>
  </div>` : ''}

  <div class="section">
    <div class="section-title">7. Duración y Modificación</div>
    <p class="justify">La presente Propuesta tendrá una validez de ${proposal.valid_until ? Math.ceil((new Date(proposal.valid_until).getTime() - Date.now()) / 86400000) : 60} días desde la fecha de emisión.</p>
  </div>

  <div class="closing"><p>Reciban un cordial saludo,</p><p style="font-weight:bold;margin-top:10px">${companyInfo.name || 'Despacho Jurídico'}</p></div>

  <div class="acceptance">
    <div class="acceptance-title">ACEPTACIÓN DE LA PROPUESTA</div>
    <div class="signatures">
      <div class="sig-block"><p>Por ${companyInfo.name || 'el Despacho'}</p><div class="sig-line"></div><div class="sig-label">Firma y sello</div></div>
      <div class="sig-block"><p>Por el Cliente</p><div class="sig-line"></div><div class="sig-label">Firma y sello</div></div>
    </div>
    <p style="text-align:center;font-size:11px;color:#666;margin-top:15px">Fecha: _____ / _____ / _____</p>
  </div>
</div></body></html>`;
}

function generateVisualHtml(proposal: any, lineItems: any[], subtotal: number, taxAmount: number, total: number): string {
  const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const pricingData = proposal.pricing_tiers_data || {};
  const phases = pricingData.phases || [];
  const team = pricingData.team || [];
  const companyInfo = pricingData.companyInfo || {};
  const terms = pricingData.terms || {};
  const dk = '#1a3a2a';
  const bg = '#f5f1eb';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Propuesta ${proposal.proposal_number}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #333; background: white; }
  .cover { background: ${bg}; padding: 60px; min-height: 500px; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; }
  .cover-label { font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: ${dk}; opacity: 0.6; }
  .cover h1 { font-size: 36px; font-weight: bold; color: ${dk}; line-height: 1.2; margin-bottom: 10px; }
  .cover-sub { font-size: 16px; color: ${dk}; opacity: 0.7; }
  .cover-client { font-size: 14px; color: ${dk}; opacity: 0.5; }
  .cover-date { font-size: 13px; color: ${dk}; opacity: 0.5; }
  .page { padding: 50px; page-break-before: always; }
  .section-num { font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: ${dk}; opacity: 0.5; margin-bottom: 5px; }
  h2 { font-size: 24px; font-weight: bold; color: ${dk}; margin-bottom: 15px; }
  .content { font-size: 13px; line-height: 1.7; color: #555; }
  .phase-card { background: ${bg}; padding: 20px; border-radius: 8px; margin-bottom: 12px; display: flex; gap: 15px; }
  .phase-num { font-size: 28px; font-weight: bold; color: ${dk}; opacity: 0.2; }
  .phase-card h3 { font-size: 14px; font-weight: bold; color: ${dk}; margin-bottom: 4px; }
  .phase-card p { font-size: 12px; color: #666; }
  .tag { display: inline-block; font-size: 11px; padding: 3px 10px; border-radius: 20px; background: ${dk}15; color: ${dk}; margin: 2px; }
  .team-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .team-card { background: ${bg}; padding: 15px; border-radius: 8px; }
  .team-card .name { font-weight: bold; font-size: 13px; color: ${dk}; }
  .team-card .role { font-size: 12px; color: #666; }
  .fee-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid ${dk}15; }
  .fee-row .bar { width: 3px; height: 30px; background: ${dk}; border-radius: 2px; margin-right: 10px; flex-shrink: 0; }
  .fee-label { font-size: 13px; font-weight: 600; color: ${dk}; }
  .fee-sub { font-size: 11px; color: #888; }
  .fee-amount { font-size: 15px; font-weight: bold; color: ${dk}; }
  .total-box { background: ${dk}; padding: 25px; border-radius: 8px; margin-top: 20px; color: white; }
  .total-box .row { display: flex; justify-content: space-between; font-size: 13px; opacity: 0.8; margin-bottom: 6px; }
  .total-box .final { display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 10px; }
  .sig-grid { display: flex; justify-content: space-between; margin-top: 40px; }
  .sig-block { width: 40%; }
  .sig-block .label { font-size: 11px; color: #888; margin-bottom: 3px; }
  .sig-block .line { border-bottom: 2px solid ${dk}; margin-top: 50px; margin-bottom: 5px; }
  .sig-block .sub { font-size: 10px; color: #aaa; }
  .closing { background: ${dk}; padding: 60px; text-align: center; page-break-before: always; }
  .closing h2 { color: white; font-size: 30px; margin-bottom: 10px; }
  .closing p { color: rgba(255,255,255,0.6); font-size: 13px; }
  .closing .sub { color: rgba(255,255,255,0.4); font-size: 11px; margin-top: 5px; }
</style></head><body>

<div class="cover">
  <div><div class="cover-label">${companyInfo.name || 'Despacho Jurídico'}</div></div>
  <div>
    <h1>${proposal.title}</h1>
    ${proposal.proposal_number ? `<div class="cover-sub">${proposal.proposal_number}</div>` : ''}
    ${proposal.contact?.name ? `<div class="cover-client">Preparado para: ${proposal.contact.name}</div>` : ''}
  </div>
  <div class="cover-date">${today}</div>
</div>

<div class="page">
  <div class="section-num">01</div>
  <h2>Sobre ${companyInfo.name || 'Nosotros'}</h2>
  <div class="content">${companyInfo.description || ''}</div>
</div>

<div class="page">
  <div class="section-num">02</div>
  <h2>Alcance del Proyecto</h2>
  ${proposal.introduction || proposal.description ? `<div class="content" style="margin-bottom:20px">${proposal.introduction || proposal.description}</div>` : ''}
  ${phases.map((p: any, i: number) => `
    <div class="phase-card">
      <div class="phase-num">${String(i+1).padStart(2,'0')}</div>
      <div>
        <h3>${p.name}</h3>
        ${p.estimatedDuration ? `<p>${p.estimatedDuration}</p>` : ''}
        ${p.description ? `<p>${p.description}</p>` : ''}
        ${p.deliverables?.length ? `<div style="margin-top:6px">${p.deliverables.map((d: string) => `<span class="tag">${d}</span>`).join('')}</div>` : ''}
      </div>
    </div>
  `).join('')}
</div>

${team.length ? `<div class="page">
  <div class="section-num">03</div>
  <h2>Equipo Responsable</h2>
  <div class="team-grid">
    ${team.map((m: any) => `<div class="team-card"><div class="name">${m.name || '—'}</div><div class="role">${m.role}</div>${m.experience ? `<div class="role">${m.experience}</div>` : ''}</div>`).join('')}
  </div>
</div>` : ''}

<div class="page">
  <div class="section-num">${team.length ? '04' : '03'}</div>
  <h2>Propuesta Económica</h2>
  ${lineItems.map(item => `
    <div class="fee-row">
      <div style="display:flex;align-items:center">
        <div class="bar"></div>
        <div><div class="fee-label">${item.name}</div><div class="fee-sub">${item.description || ''}</div></div>
      </div>
      <div class="fee-amount">${item.total_price?.toFixed(2)} €</div>
    </div>
  `).join('')}
  <div class="total-box">
    <div class="row"><span>Subtotal</span><span>${subtotal.toFixed(2)} €</span></div>
    <div class="row"><span>IVA (21%)</span><span>${taxAmount.toFixed(2)} €</span></div>
    <div class="final"><span>Total</span><span>${total.toFixed(2)} €</span></div>
  </div>
</div>

<div class="page">
  <div class="section-num">${team.length ? '05' : '04'}</div>
  <h2>Términos y Condiciones</h2>
  <div class="content">
    <p style="margin-bottom:10px"><strong>Validez:</strong> ${proposal.valid_until ? `Hasta ${new Date(proposal.valid_until).toLocaleDateString('es-ES')}` : '60 días desde la emisión'}.</p>
    ${terms.paymentTerms ? `<p style="margin-bottom:10px"><strong>Pago:</strong> ${terms.paymentTerms}</p>` : ''}
    <p style="margin-bottom:10px"><strong>Gastos:</strong> ${terms.expensesIncluded ? 'Incluidos.' : 'A cargo del cliente.'}</p>
    ${terms.confidentialityClause !== false ? `<p><strong>Confidencialidad:</strong> Garantizada.</p>` : ''}
  </div>
</div>

<div class="page">
  <div class="section-num">${team.length ? '06' : '05'}</div>
  <h2>Aceptación</h2>
  <div class="content" style="margin-bottom:20px">Para formalizar la aceptación, rogamos nos devuelvan copia firmada.</div>
  <div class="sig-grid">
    <div class="sig-block"><div class="label">Por ${companyInfo.name || 'el Despacho'}</div><div class="line"></div><div class="sub">Firma y sello</div></div>
    <div class="sig-block"><div class="label">Por el Cliente</div><div class="line"></div><div class="sub">Firma y sello</div></div>
  </div>
</div>

<div class="closing">
  <h2>Gracias</h2>
  <p>${companyInfo.name || 'Despacho Jurídico'}</p>
  <div class="sub">Asesores Legales y Tributarios</div>
</div>

</body></html>`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { proposalId, totalAmount, currency = 'EUR', lineItems, style = 'formal' }: GenerateProposalPdfRequest = await req.json();

    if (!proposalId) {
      return new Response(JSON.stringify({ error: 'proposalId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select(`
        *,
        contact:contacts!proposals_contact_id_fkey(
          id, name, email, phone, dni_nif
        )
      `)
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposal) {
      return new Response(JSON.stringify({ error: 'Propuesta no encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subtotal = lineItems.reduce((sum: number, item: any) => sum + (item.total_price || 0), 0);
    const taxRate = 0.21;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    const htmlContent = style === 'visual'
      ? generateVisualHtml(proposal, lineItems, subtotal, taxAmount, total)
      : generateFormalHtml(proposal, lineItems, subtotal, taxAmount, total);

    const htmlBlob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' });
    
    return new Response(htmlBlob, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="propuesta-${proposal.proposal_number}.html"`,
      },
    });

  } catch (error) {
    console.error('Error generating proposal PDF:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
