/**
 * Utilidades de clasificación inteligente de contactos.
 * Detecta si un nombre parece empresa cuando el tipo es persona física.
 */

const COMPANY_SUFFIXES = [
  /\b(S\.?L\.?U?)\b/i,
  /\b(S\.?A\.?)\b/i,
  /\b(S\.?L\.?L\.?)\b/i,
  /\b(S\.?L\.?P\.?U?)\b/i,
  /\b(S\.?C\.?)\b/i,
  /\b(S\.?COOP)\b/i,
  /\b(LIMITED|LTD|GMBH|INC|CORP|LLC|PLC)\b/i,
  /\b(B\.?V\.?)\b/i,
  /\b(SAS|SRL)\b/i,
  /\bSCP\b/i,
  /\bCB\b/i,
]

const COMPANY_KEYWORDS = [
  /\b(SOCIEDAD|FUNDACI[OÓ]N|ASOCIACI[OÓ]N|ASSOCIACI[OÓ]|COOPERATIVA)\b/i,
  /\b(COMMUNITY|GROUP|HOLDING|CAPITAL|CONSULTING|PARTNERS)\b/i,
  /\bCDAD\.?\s*DE\s*PROP/i,
  /\b(MISIONERAS|MONASTERIO|CLARISAS)\b/i,
  // Keywords de negocio ampliados
  /\b(ABOGADOS|HOTELES?|HOSPEDERA|MARKETING|PATRIMONIAL)\b/i,
  /\b(INMOBILIARIA|CONSTRUCCI[OÓ]N|TRANSPORTES?|COMERCIAL)\b/i,
  /\b(DISTRIBUIDORA|INSTALACIONES|EL[EÉ]CTRICAS?|SERVICIOS)\b/i,
  /\b(PROMOTORA|INVERSIONES|GESTI[OÓ]N|ASESOR[IÍ]A|CONSULTOR[IÍ]A)\b/i,
  /\b(HOSTELERA|ALIMENTACI[OÓ]N|FARMAC[IÍ]A|CL[IÍ]NICA)\b/i,
  // Abreviaturas catalanas y variantes
  /\bFUNDACIO\b/i,
  /\bINDUST\b\.?/i,
  /\bINST\b\.?/i,
]

const NIF_EMPRESA_REGEX = /^[A-HJ-NP-SUVW]/

// Patrones de registros contables/basura que no son contactos reales
const JUNK_PATTERNS = [
  /\.{3,}/,                               // Nombres con puntos suspensivos
  /\bNO\s+USAR\b/i,
  /\bCLIENTES\s+(VARIOS|DUDOSO)\b/i,
  /\bDEUDORES\b/i,
  /\bREGISTRO\s+MERCANTIL\b/i,
  /\bFACT\.?\s*PEND/i,
]

export interface ClassificationResult {
  looksLikeCompany: boolean
  confidence: number
  matchedPatterns: string[]
  isJunk?: boolean
}

/**
 * Analiza si un nombre + NIF parecen empresa.
 * Devuelve confianza y patrones coincidentes.
 */
export function detectCompanyPattern(name: string, dniNif?: string): ClassificationResult {
  const matchedPatterns: string[] = []
  let confidence = 0
  let isJunk = false

  if (!name) return { looksLikeCompany: false, confidence: 0, matchedPatterns: [], isJunk: false }

  const trimmedName = name.trim()

  // Detectar registros basura primero
  for (const regex of JUNK_PATTERNS) {
    if (regex.test(trimmedName)) {
      isJunk = true
      matchedPatterns.push('junk')
      break
    }
  }

  for (const regex of COMPANY_SUFFIXES) {
    if (regex.test(trimmedName)) {
      matchedPatterns.push('suffix')
      confidence = Math.max(confidence, 0.95)
      break
    }
  }

  for (const regex of COMPANY_KEYWORDS) {
    if (regex.test(trimmedName)) {
      matchedPatterns.push('keyword')
      confidence = Math.max(confidence, 0.85)
      break
    }
  }

  if (dniNif && NIF_EMPRESA_REGEX.test(dniNif.trim())) {
    matchedPatterns.push('nif_empresa')
    confidence = Math.max(confidence, 0.85)
  }

  return {
    looksLikeCompany: confidence >= 0.70,
    confidence,
    matchedPatterns,
    isJunk,
  }
}
