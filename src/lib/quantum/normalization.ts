/**
 * Normalización de texto mejorada para detección de duplicados
 * Maneja acentos, tildes y caracteres especiales
 */

/**
 * Normaliza texto removiendo acentos, tildes y caracteres especiales
 * para comparaciones más precisas en detección de duplicados
 */
export const normalizeText = (text: string): string => {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD') // Descomponer caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos (tildes, acentos)
    .replace(/[^\w\s]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, ' ') // Normalizar espacios múltiples
}

/**
 * Normaliza DNI/NIF removiendo espacios y guiones
 */
export const normalizeNif = (nif: string): string => {
  if (!nif) return ''
  
  return nif
    .replace(/[\s-]/g, '') // Remover espacios y guiones
    .toUpperCase()
    .trim()
}

/**
 * Normaliza email a lowercase y trim
 */
export const normalizeEmail = (email: string): string => {
  if (!email) return ''
  
  return email
    .toLowerCase()
    .trim()
}

/**
 * Normaliza teléfono removiendo todos los caracteres no numéricos
 */
export const normalizePhone = (phone: string): string => {
  if (!phone) return ''
  
  return phone.replace(/\D/g, '') // Solo números
}