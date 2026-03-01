/**
 * Generador centralizado de HTML para PDFs de propuestas
 */

export interface PDFClientInfo {
  name: string
  nif?: string
  email?: string
  phone?: string
}

export interface PDFServiceRow {
  name: string
  description?: string
  quantity: number
  unitPrice: number
  total: number
  discountLabel?: string
}

export interface PDFRetainerConfig {
  retainerAmount: number
  includedHours: number
  extraHourlyRate: number
  billingFrequency: string
  contractDuration: number
  autoRenewal?: boolean
  paymentTerms?: number
}

export interface GenerateProposalPDFOptions {
  type: 'one-time' | 'retainer'
  title: string
  refNumber: string
  date: string
  validUntil?: string
  client?: PDFClientInfo
  firmName?: string
  firmLogo?: string // URL o base64
  rows: PDFServiceRow[]
  totals: {
    subtotal: number
    tax: number
    taxRate: number
    total: number
  }
  hasDiscountColumn?: boolean
  retainerConfig?: PDFRetainerConfig
  introduction?: string
  terms?: string
  practiceArea?: string
  validityDays?: number
  currency?: string
}

const FIRM_NAME_DEFAULT = 'Navarro & Asociados'

const fmt = (n: number, currency = 'EUR') =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n)

export function generateProposalPDF(opts: GenerateProposalPDFOptions): string {
  const {
    type,
    title,
    refNumber,
    date,
    validUntil,
    client,
    firmName = FIRM_NAME_DEFAULT,
    firmLogo,
    rows,
    totals,
    hasDiscountColumn = false,
    retainerConfig,
    introduction,
    terms,
    practiceArea,
    validityDays,
    currency = 'EUR',
  } = opts

  const f = (n: number) => fmt(n, currency)

  // -- Logo or text fallback --
  const logoHtml = firmLogo
    ? `<img src="${firmLogo}" alt="${firmName}" style="max-height:48px;max-width:180px;object-fit:contain" />`
    : `<div style="font-size:24px;font-weight:700;color:#0061FF">${firmName}</div>`

  // -- Client block --
  const clientBlock = client
    ? `<div class="client-box">
        <div class="section-label">DATOS DEL CLIENTE</div>
        <div class="client-name">${client.name}</div>
        <div class="client-grid">
          ${client.nif ? `<div class="client-field"><span class="field-label">NIF/CIF:</span> ${client.nif}</div>` : ''}
          ${client.email ? `<div class="client-field"><span class="field-label">Email:</span> ${client.email}</div>` : ''}
          ${client.phone ? `<div class="client-field"><span class="field-label">Teléfono:</span> ${client.phone}</div>` : ''}
        </div>
      </div>`
    : ''

  // -- Service rows --
  const serviceRows = rows
    .map(
      (r) => `<tr>
      <td class="td-name">${r.name}${r.description ? `<br><small class="desc">${r.description}</small>` : ''}</td>
      <td class="td-center">${r.quantity}</td>
      <td class="td-right">${f(r.unitPrice)}</td>
      ${hasDiscountColumn ? `<td class="td-right td-discount">${r.discountLabel || ''}</td>` : ''}
      <td class="td-right td-bold">${f(r.total)}</td>
    </tr>`
    )
    .join('')

  // -- Retainer box (only for retainer type) --
  const freqLabels: Record<string, string> = { monthly: 'Mensual', quarterly: 'Trimestral', yearly: 'Anual' }
  const retainerBox =
    type === 'retainer' && retainerConfig
      ? `<h2>Condiciones del Retainer</h2>
      <div class="retainer-box"><dl>
        <dt>Cuota ${freqLabels[retainerConfig.billingFrequency] || 'Mensual'}</dt><dd>${f(retainerConfig.retainerAmount)}</dd>
        <dt>Horas incluidas</dt><dd>${retainerConfig.includedHours} h</dd>
        <dt>Tarifa hora extra</dt><dd>${f(retainerConfig.extraHourlyRate)}/h</dd>
        <dt>Duración del contrato</dt><dd>${retainerConfig.contractDuration} meses</dd>
        ${retainerConfig.autoRenewal !== undefined ? `<dt>Renovación automática</dt><dd>${retainerConfig.autoRenewal ? 'Sí' : 'No'}</dd>` : ''}
        ${retainerConfig.paymentTerms ? `<dt>Plazo de pago</dt><dd>${retainerConfig.paymentTerms} días</dd>` : ''}
      </dl></div>`
      : ''

  // -- Introduction section --
  const introSection = introduction
    ? `<h2>Introducción</h2><p>${introduction}</p>`
    : ''

  // -- Terms section --
  const termsSection = terms
    ? `<h2>Términos y Condiciones</h2><p class="terms-text">${terms}</p>`
    : ''

  // -- Signature block (retainer only) --
  const signatureBlock =
    type === 'retainer'
      ? `<h2>Aceptación</h2>
      <p>La presente propuesta tiene una validez de <strong>${validityDays || 30} días</strong> desde la fecha de emisión.</p>
      <div class="signature">
        <div class="sig-block"><p>Firma del Cliente</p><p class="meta">Fecha: _______________</p></div>
        <div class="sig-block"><p>Firma del Asesor</p><p class="meta">Fecha: _______________</p></div>
      </div>`
      : ''

  const typeLabel = type === 'retainer' ? 'Propuesta de Servicios Recurrentes' : 'Propuesta Comercial'
  const subtitleText = practiceArea ? `${typeLabel} — ${practiceArea}` : typeLabel

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${title || typeLabel} - ${refNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Manrope',sans-serif;color:#1a1a1a;padding:40px 48px;max-width:820px;margin:0 auto;font-size:14px;line-height:1.6}

  /* Header */
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:16px;border-bottom:3px solid #0061FF}
  .header-left{display:flex;align-items:center;gap:16px}
  .header-right{text-align:right;font-size:12px;color:#666;line-height:1.8}
  .header-right .ref{font-size:14px;font-weight:700;color:#1a1a1a}
  .subtitle{font-size:13px;color:#666;margin-top:2px}

  /* Client box */
  .client-box{background:#f8f9fa;border:1px solid #e0e0e0;border-radius:8px;padding:16px 20px;margin-bottom:28px}
  .section-label{font-size:11px;text-transform:uppercase;letter-spacing:1.2px;color:#888;font-weight:600;margin-bottom:8px}
  .client-name{font-weight:700;font-size:16px;margin-bottom:6px}
  .client-grid{display:flex;flex-wrap:wrap;gap:8px 24px}
  .client-field{font-size:13px;color:#555}
  .field-label{font-weight:600;color:#333}

  /* Proposal title */
  .proposal-title{font-size:18px;font-weight:700;margin-bottom:24px;color:#1a1a1a}

  /* Sections */
  h2{font-size:15px;font-weight:700;margin:28px 0 10px;padding-bottom:6px;border-bottom:2px solid #0061FF;color:#0061FF}

  /* Table */
  table{width:100%;border-collapse:collapse;margin:12px 0 28px}
  th{background:#f3f4f6;padding:10px 12px;text-align:left;font-weight:600;font-size:13px;border-bottom:2px solid #d1d5db}
  .td-name{padding:10px 12px;border-bottom:1px solid #e5e7eb}
  .td-center{padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center}
  .td-right{padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right}
  .td-bold{font-weight:600}
  .td-discount{color:#dc2626}
  .desc{color:#666;font-size:12px}

  /* Totals */
  .totals{margin-left:auto;width:300px;margin-bottom:28px}
  .totals .row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px}
  .totals .total-row{border-top:2px solid #1a1a1a;padding-top:10px;margin-top:6px;font-size:18px;font-weight:700;color:#0061FF}

  /* Retainer */
  .retainer-box{background:#f0f6ff;border:1px solid #bfd7ff;border-radius:8px;padding:20px;margin:12px 0}
  .retainer-box dt{font-weight:600;color:#0061FF;font-size:13px}
  .retainer-box dd{margin:0 0 12px;font-size:14px}

  /* Terms */
  .terms-text{white-space:pre-line;font-size:13px;color:#555;background:#f8f9fa;padding:14px;border-radius:6px}

  /* Signature */
  .signature{display:flex;justify-content:space-between;margin-top:40px}
  .sig-block{width:44%;border-top:1px solid #1a1a1a;padding-top:8px;font-size:13px}
  .meta{color:#6b7280;font-size:12px}

  /* Footer */
  .footer{margin-top:48px;padding-top:14px;border-top:1px solid #e0e0e0;font-size:11px;color:#999;text-align:center;line-height:1.8}
  .footer .firm{font-weight:600;color:#666}

  @media print{
    body{padding:20px}
    @page{margin:18mm 15mm 22mm;@bottom-center{content:"${firmName} — Página " counter(page);font-size:9px;color:#999}}
  }
</style></head><body>

<div class="header">
  <div class="header-left">
    ${logoHtml}
    <div>
      <div style="font-size:13px;font-weight:600;color:#333">${firmName}</div>
      <div class="subtitle">${subtitleText}</div>
    </div>
  </div>
  <div class="header-right">
    <div class="ref">${refNumber}</div>
    <div>Fecha: ${date}</div>
    ${validUntil ? `<div>Válida hasta: ${validUntil}</div>` : ''}
  </div>
</div>

${clientBlock}

${title ? `<div class="proposal-title">${title}</div>` : ''}

${introSection}

<h2>Servicios Propuestos</h2>
<table>
  <thead><tr>
    <th>Concepto</th>
    <th style="text-align:center">Cant.</th>
    <th style="text-align:right">Precio Unit.</th>
    ${hasDiscountColumn ? '<th style="text-align:right">Dto.</th>' : ''}
    <th style="text-align:right">Total</th>
  </tr></thead>
  <tbody>${serviceRows}</tbody>
</table>

<div class="totals">
  <div class="row"><span>Subtotal</span><span>${f(totals.subtotal)}</span></div>
  <div class="row"><span>IVA (${totals.taxRate}%)</span><span>${f(totals.tax)}</span></div>
  <div class="row total-row"><span>Total</span><span>${f(totals.total)}</span></div>
</div>

${retainerBox}
${termsSection}
${signatureBlock}

<div class="footer">
  <span class="firm">${firmName}</span> · Documento generado el ${date}<br>
  Esta propuesta tiene carácter informativo y no constituye factura. Precios sujetos a IVA vigente.
</div>

</body></html>`
}

/**
 * Abre una ventana de impresión con el HTML generado
 */
export function openProposalPrintWindow(html: string) {
  const w = window.open('', '_blank')
  if (w) {
    w.document.write(html)
    w.document.close()
    w.onload = () => w.print()
  }
}
