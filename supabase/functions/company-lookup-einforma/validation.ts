
export function isValidNifCif(nif: string): boolean {
  if (!nif || typeof nif !== 'string') return false
  
  const cleanNif = nif.replace(/[\s-]/g, '').toUpperCase()
  
  // Patrones de validación
  const nifRegex = /^[0-9]{8}[A-Z]$/
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
  
  const isValid = nifRegex.test(cleanNif) || cifRegex.test(cleanNif) || nieRegex.test(cleanNif)
  
  console.log('🔍 [validation] Validación formato:', {
    nif: cleanNif,
    isNif: nifRegex.test(cleanNif),
    isCif: cifRegex.test(cleanNif),
    isNie: nieRegex.test(cleanNif),
    isValid
  })
  
  return isValid
}
