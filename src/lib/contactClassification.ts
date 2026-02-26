/**
 * Utilidades de clasificación inteligente de contactos.
 * Detecta si un nombre parece empresa cuando el tipo es persona física.
 */

const COMPANY_SUFFIXES = [
  /\b(S\.?L\.?U?)\b/i,
  /\b(S\.?A\.?)\b/i,
  /\b(S\.?L\.?L\.?)\b/i,
  /\b(S\.?C\.?)\b/i,
  /\b(S\.?COOP)\b/i,
  /\b(LIMITED|LTD|GMBH|INC|CORP|LLC|PLC)\b/i,
]

const COMPANY_KEYWORDS = [
  /\b(SOCIEDAD|FUNDACI[OÓ]N|ASOCIACI[OÓ]N|ASSOCIACI[OÓ]|COOPERATIVA)\b/i,
  /\b(COMMUNITY|GROUP|HOLDING|CAPITAL|CONSULTING|PARTNERS)\b/i,
]

const NIF_EMPRESA_REGEX = /^[A-HJ-NP-SUVW]/

export interface ClassificationResult {
  looksLikeCompany: boolean
  confidence: number
  matchedPatterns: string[]
}

/**
 * Analiza si un nombre + NIF parecen empresa.
 * Devuelve confianza y patrones coincidentes.
 */
export function detectCompanyPattern(name: string, dniNif?: string): ClassificationResult {
  const matchedPatterns: string[] = []
  let confidence = 0

  if (!name) return { looksLikeCompany: false, confidence: 0, matchedPatterns: [] }

  const trimmedName = name.trim()

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
  }
}
