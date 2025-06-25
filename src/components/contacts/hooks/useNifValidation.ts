
import { useState } from 'react'

// Función de validación centralizada (sincronizada con useCompanyLookup)
const validateNifCifFormat = (nif: string): { isValid: boolean; error?: string } => {
  const cleanNif = nif.replace(/[\s-]/g, '').toUpperCase()
  
  // Validación de longitud
  if (cleanNif.length < 8) {
    return { isValid: false, error: 'Debe tener al menos 8 caracteres' }
  }
  
  if (cleanNif.length > 9) {
    return { isValid: false, error: 'No puede tener más de 9 caracteres' }
  }
  
  // Patrones de validación específicos
  const nifRegex = /^[0-9]{8}[A-Z]$/
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
  
  const isValidFormat = nifRegex.test(cleanNif) || cifRegex.test(cleanNif) || nieRegex.test(cleanNif)
  
  if (!isValidFormat) {
    return { 
      isValid: false, 
      error: 'Formato no válido. Ejemplos: B12345678, 12345678Z, X1234567L' 
    }
  }
  
  return { isValid: true }
}

export const useNifValidation = (initialNif: string = '') => {
  const [nif, setNif] = useState(initialNif)

  const formatNif = (value: string) => {
    // Sanitizar entrada: eliminar caracteres no permitidos
    const sanitized = value.replace(/[^0-9A-Za-z]/g, '').toUpperCase()
    
    // Limitar longitud máxima
    if (sanitized.length <= 9) {
      setNif(sanitized)
    }
  }

  const isValidFormat = (nif: string): boolean => {
    const validation = validateNifCifFormat(nif)
    return validation.isValid
  }

  const getValidationMessage = (): string | null => {
    if (!nif) return null
    
    const validation = validateNifCifFormat(nif)
    return validation.error || null
  }

  // Validación en tiempo real más estricta
  const getValidationState = (): 'valid' | 'invalid' | 'partial' => {
    if (!nif) return 'partial'
    
    const cleanNif = nif.replace(/[\s-]/g, '').toUpperCase()
    
    // Si está en progreso (menos de 8 caracteres)
    if (cleanNif.length < 8) return 'partial'
    
    // Si excede la longitud máxima
    if (cleanNif.length > 9) return 'invalid'
    
    // Validar formato completo
    const validation = validateNifCifFormat(nif)
    return validation.isValid ? 'valid' : 'invalid'
  }

  return {
    nif,
    setNif,
    formatNif,
    isValidFormat,
    getValidationMessage,
    getValidationState
  }
}
