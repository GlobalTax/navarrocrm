/**
 * Utilidades de tipado y validación
 */

export interface EmailPreferences {
  receive_followups: boolean
  receive_reminders: boolean
  receive_invitations: boolean
}

export const defaultEmailPreferences: EmailPreferences = {
  receive_followups: true,
  receive_reminders: true,
  receive_invitations: true
}

export const parseEmailPreferences = (preferences: any): EmailPreferences | null => {
  if (!preferences || typeof preferences !== 'object') {
    return null
  }

  return {
    receive_followups: Boolean(preferences.receive_followups),
    receive_reminders: Boolean(preferences.receive_reminders),
    receive_invitations: Boolean(preferences.receive_invitations)
  }
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[0-9\s-()]{9,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const isValidNIF = (nif: string): boolean => {
  const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i
  if (!nifRegex.test(nif)) return false
  
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
  const number = parseInt(nif.substring(0, 8), 10)
  const letter = nif.charAt(8).toUpperCase()
  
  return letters.charAt(number % 23) === letter
}

export const sanitizeString = (str: string | null | undefined): string => {
  if (!str) return ''
  return str.trim().replace(/\s+/g, ' ')
}

export const parseJSON = <T>(json: string | null, fallback: T): T => {
  if (!json) return fallback
  
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}