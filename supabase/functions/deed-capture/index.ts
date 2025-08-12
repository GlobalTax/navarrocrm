import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Papa from "npm:papaparse@5.4.1"
// pdfjs-dist via esm build for Deno
import * as pdfjsLib from "https://esm.sh/pdfjs-dist@4.4.168/build/pdf.mjs"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Configure pdf.js worker
;(pdfjsLib as any).GlobalWorkerOptions ||= {}
;(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  "https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') as string
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

interface CaptureRequest {
  deed_id: string
  type: 'csv' | 'asiento_pdf'
  bucket?: string
  path: string // storage path like `${userId}/deeds/{deed_id}/file.ext`
  org_id?: string
}

function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function parseSpanishDate(s?: string | null): string | null {
  if (!s) return null
  const txt = String(s).trim()
  // dd/mm/yyyy or dd-mm-yyyy with optional time HH:MM[:SS]
  const m = txt.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:\s+(\d{1,2}:\d{2}(?::\d{2})?))?/)
  if (!m) return null
  const d = parseInt(m[1], 10)
  const mo = parseInt(m[2], 10) - 1
  let y = parseInt(m[3], 10)
  if (y < 100) y += 2000
  const date = new Date(y, mo, d)
  if (m[4]) {
    const [hh, mm, ss] = m[4].split(':').map((x) => parseInt(x, 10))
    date.setHours(hh || 0, mm || 0, ss || 0, 0)
  }
  return date.toISOString()
}

function extractFromCSV(text: string) {
  const parsed = Papa.parse(text, { header: true })
  const rows = (parsed.data as any[]).filter(Boolean)
  if (rows.length === 0) {
    // try no header
    const alt = Papa.parse(text, { header: false })
    const h = (alt.data[0] as string[] | undefined) || []
    const body = (alt.data.slice(1) as any[])
    const headerMap = new Map<string, number>()
    h.forEach((name, i) => headerMap.set(normalizeHeader(String(name || '')), i))
    const getVal = (row: any[], keys: string[]) => {
      for (const k of keys) {
        const idx = headerMap.get(k)
        if (idx != null && row[idx]) return String(row[idx])
      }
      return null
    }
    const row0 = body[0] as any[] | undefined
    if (!row0) return {}
    const protocolo = getVal(row0, ['protocolo','numero protocolo','n protocolo','n de protocolo','protocol'])
    const notario = getVal(row0, ['notario','notary'])
    const fecha = getVal(row0, ['fecha','fecha firma','fecha de firma','otorgamiento','fecha otorgamiento'])
    return {
      protocol_number: protocolo || null,
      notary_name: notario || null,
      signing_date: parseSpanishDate(fecha),
    }
  }

  // header present
  const headers = Object.keys(rows[0] || {})
  const keyByNorm: Record<string, string> = {}
  for (const h of headers) keyByNorm[normalizeHeader(h)] = h

  const pick = (alts: string[]) => {
    for (const a of alts) {
      const k = keyByNorm[a]
      if (k && rows[0][k] != null && String(rows[0][k]).trim() !== '') return String(rows[0][k])
    }
    return null
  }

  const protocolo = pick(['protocolo','numero protocolo','n protocolo','n de protocolo','protocol'])
  const notario = pick(['notario','notary'])
  const fecha = pick(['fecha','fecha firma','fecha de firma','otorgamiento','fecha otorgamiento'])

  return {
    protocol_number: protocolo || null,
    notary_name: notario || null,
    signing_date: parseSpanishDate(fecha),
  }
}

async function extractFromPDF(bytes: Uint8Array) {
  const pdf = await (pdfjsLib as any).getDocument({ data: bytes }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const items = content.items?.map((it: any) => it.str).join(' ') || ''
    text += ' ' + items
  }
  const flat = text.replace(/\s+/g, ' ')
  // asiento number
  let asiento_number: string | null = null
  const mAsiento = flat.match(/asiento\s*(?:n[uú]mero|nº|no\.?|num\.?|#)?\s*[:\-]?\s*(\d{1,6})/i)
  if (mAsiento) asiento_number = mAsiento[1]

  // presentation date/time
  let presentationISO: string | null = null
  const pres = flat.match(/presentaci[oó]n[^\d]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})(?:[^\d]+(\d{1,2}:\d{2}(?::\d{2})?))?/i)
  if (pres) {
    const dt = pres[1] + (pres[2] ? ' ' + pres[2] : '')
    presentationISO = parseSpanishDate(dt)
  }

  return { asiento_number, registry_submission_date: presentationISO }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  try {
    const { deed_id, type, bucket = 'deed_docs', path, org_id }: CaptureRequest = await req.json()

    if (!deed_id || !type || !path) {
      return new Response(JSON.stringify({ ok: false, error: 'Faltan parámetros (deed_id, type, path)' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    // Optional: verify deed belongs to org_id if provided
    if (org_id) {
      const { data: deed, error: deedErr } = await supabase
        .from('deeds')
        .select('id, org_id')
        .eq('id', deed_id)
        .maybeSingle()
      if (deedErr) throw deedErr
      if (!deed) return new Response(JSON.stringify({ ok: false, error: 'Expediente no encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
      if (deed.org_id !== org_id) return new Response(JSON.stringify({ ok: false, error: 'Org no coincide' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    const { data: fileData, error: dlErr } = await supabase.storage.from(bucket).download(path)
    if (dlErr || !fileData) {
      console.error('Error downloading file', dlErr)
      return new Response(JSON.stringify({ ok: false, error: 'No se pudo descargar el archivo' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    let updates: Record<string, any> = {}

    if (type === 'csv') {
      const text = await fileData.text()
      const out = extractFromCSV(text)
      updates = {
        ...(out.protocol_number ? { protocol_number: out.protocol_number } : {}),
        ...(out.notary_name ? { notary_name: out.notary_name } : {}),
        ...(out.signing_date ? { signing_date: out.signing_date } : {}),
      }
    } else if (type === 'asiento_pdf') {
      const buf = new Uint8Array(await fileData.arrayBuffer())
      const out = await extractFromPDF(buf)
      updates = {
        ...(out.asiento_number ? { asiento_number: out.asiento_number } : {}),
        ...(out.registry_submission_date ? { registry_submission_date: out.registry_submission_date } : {}),
      }
    } else {
      return new Response(JSON.stringify({ ok: false, error: 'Tipo no soportado' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ ok: false, error: 'No se detectaron datos a actualizar' }), { status: 422, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    const { error: upErr } = await supabase
      .from('deeds')
      .update(updates)
      .eq('id', deed_id)
    if (upErr) throw upErr

    return new Response(JSON.stringify({ ok: true, deed_id, updates }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  } catch (error) {
    console.error('deed-capture error', error)
    return new Response(JSON.stringify({ ok: false, error: (error as any)?.message || 'Unknown error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  }
})
