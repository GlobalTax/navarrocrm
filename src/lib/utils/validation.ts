/**
 * Utilidades de validación centralizadas
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  const isValid = value !== null && value !== undefined && value !== ''
  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} es requerido`]
  }
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, errors: ['Email es requerido'] }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = emailRegex.test(email)
  
  return {
    isValid,
    errors: isValid ? [] : ['Email no tiene un formato válido']
  }
}

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: true, errors: [] } // Phone is optional
  }
  
  const phoneRegex = /^[+]?[0-9\s-()]{9,15}$/
  const isValid = phoneRegex.test(phone.replace(/\s/g, ''))
  
  return {
    isValid,
    errors: isValid ? [] : ['Teléfono no tiene un formato válido']
  }
}

export const validateLength = (
  value: string, 
  min: number, 
  max: number, 
  fieldName: string
): ValidationResult => {
  if (!value) {
    return { isValid: false, errors: [`${fieldName} es requerido`] }
  }
  
  const length = value.length
  const isValid = length >= min && length <= max
  
  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} debe tener entre ${min} y ${max} caracteres`]
  }
}

export const combineValidations = (...validations: ValidationResult[]): ValidationResult => {
  const allErrors = validations.flatMap(v => v.errors)
  return {
    isValid: validations.every(v => v.isValid),
    errors: allErrors
  }
}

// Validaciones específicas del dominio
export const validateContactName = (name: string): ValidationResult => {
  return combineValidations(
    validateRequired(name, 'Nombre'),
    validateLength(name, 2, 100, 'Nombre')
  )
}

export const validateContactEmail = (email: string, required = false): ValidationResult => {
  if (!email && !required) {
    return { isValid: true, errors: [] }
  }
  
  return validateEmail(email)
}

export const validateProposalTitle = (title: string): ValidationResult => {
  return combineValidations(
    validateRequired(title, 'Título'),
    validateLength(title, 5, 200, 'Título')
  )
}

export const validateAmount = (amount: number, fieldName = 'Importe'): ValidationResult => {
  if (amount === null || amount === undefined) {
    return { isValid: false, errors: [`${fieldName} es requerido`] }
  }
  
  const isValid = amount > 0
  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} debe ser mayor que 0`]
  }
}