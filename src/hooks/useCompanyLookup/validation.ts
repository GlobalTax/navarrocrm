
// Función de validación centralizada y mejorada
export const validateNifCif = (nif: string): { isValid: boolean; cleanNif: string; error?: string } => {
  const cleanNif = nif?.trim().toUpperCase() || ''
  
  // Validación de longitud mínima
  if (!cleanNif || cleanNif.length < 8) {
    return {
      isValid: false,
      cleanNif,
      error: 'El NIF/CIF debe tener al menos 8 caracteres'
    }
  }

  // Validación de longitud máxima
  if (cleanNif.length > 9) {
    return {
      isValid: false,
      cleanNif,
      error: 'El NIF/CIF no puede tener más de 9 caracteres'
    }
  }

  // Patrones de validación específicos y estrictos
  const nifRegex = /^[0-9]{8}[A-Z]$/
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
  
  const isValidFormat = nifRegex.test(cleanNif) || cifRegex.test(cleanNif) || nieRegex.test(cleanNif)
  
  if (!isValidFormat) {
    return {
      isValid: false,
      cleanNif,
      error: 'Formato NIF/CIF inválido. Debe ser formato español válido (ej: B12345678, 12345678Z, X1234567L)'
    }
  }

  return { isValid: true, cleanNif }
}

// Función para validar datos recibidos de la API
export const validateCompanyData = (data: any): { isValid: boolean; error?: string } => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Datos de empresa no válidos' }
  }

  // Campos obligatorios
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    return { isValid: false, error: 'El nombre de la empresa es obligatorio' }
  }

  if (!data.nif || typeof data.nif !== 'string' || data.nif.trim().length === 0) {
    return { isValid: false, error: 'El NIF/CIF de la empresa es obligatorio' }
  }

  // Validar que el status sea válido
  if (data.status && !['activo', 'inactivo'].includes(data.status)) {
    return { isValid: false, error: 'Estado de empresa no válido' }
  }

  return { isValid: true }
}
