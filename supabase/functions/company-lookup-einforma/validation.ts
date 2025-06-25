
// Validación mejorada y sincronizada con el frontend
export function isValidNifCif(nif: string): boolean {
  if (!nif || typeof nif !== 'string') return false
  
  const cleanNif = nif.replace(/[\s-]/g, '').toUpperCase()
  
  // Validación de longitud estricta
  if (cleanNif.length < 8 || cleanNif.length > 9) {
    console.log('🔍 [validation] Longitud inválida:', cleanNif.length)
    return false
  }
  
  // Patrones de validación específicos (sincronizados con frontend)
  const nifRegex = /^[0-9]{8}[A-Z]$/
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
  
  const isNif = nifRegex.test(cleanNif)
  const isCif = cifRegex.test(cleanNif)
  const isNie = nieRegex.test(cleanNif)
  
  const isValid = isNif || isCif || isNie
  
  console.log('🔍 [validation] Validación formato:', {
    nif: cleanNif,
    length: cleanNif.length,
    isNif,
    isCif,
    isNie,
    isValid
  })
  
  return isValid
}

// Función para validar y sanitizar entrada
export function validateAndSanitizeNif(nif: string): { isValid: boolean; cleanNif: string; error?: string } {
  if (!nif || typeof nif !== 'string') {
    return { isValid: false, cleanNif: '', error: 'NIF/CIF is required' }
  }
  
  // Sanitizar: eliminar espacios, guiones y convertir a mayúsculas
  const cleanNif = nif.replace(/[\s-]/g, '').toUpperCase()
  
  // Validar caracteres permitidos
  if (!/^[0-9A-Z]+$/.test(cleanNif)) {
    return { isValid: false, cleanNif, error: 'Contains invalid characters' }
  }
  
  // Validar longitud
  if (cleanNif.length < 8) {
    return { isValid: false, cleanNif, error: 'Too short (minimum 8 characters)' }
  }
  
  if (cleanNif.length > 9) {
    return { isValid: false, cleanNif, error: 'Too long (maximum 9 characters)' }
  }
  
  // Validar formato
  if (!isValidNifCif(cleanNif)) {
    return { isValid: false, cleanNif, error: 'Invalid format' }
  }
  
  return { isValid: true, cleanNif }
}
