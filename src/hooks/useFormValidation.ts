import { useState, useEffect } from 'react'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export interface ValidationSchema {
  [field: string]: ValidationRule
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  touched: Record<string, boolean>
  validateField: (field: string, value: any) => string | null
  touchField: (field: string) => void
  reset: () => void
}

export function useFormValidation(schema: ValidationSchema, initialData: any = {}): ValidationResult {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (field: string, value: any): string | null => {
    const rule = schema[field]
    if (!rule) return null

    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      return 'Este campo es obligatorio'
    }

    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === '') {
      return null
    }

    // Min length validation
    if (rule.minLength && value.toString().length < rule.minLength) {
      return `Debe tener al menos ${rule.minLength} caracteres`
    }

    // Max length validation
    if (rule.maxLength && value.toString().length > rule.maxLength) {
      return `No puede exceder ${rule.maxLength} caracteres`
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value.toString())) {
      return 'Formato no válido'
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value)
    }

    return null
  }

  const touchField = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const reset = () => {
    setErrors({})
    setTouched({})
  }

  // Compute isValid
  const isValid = Object.keys(schema).every(field => {
    const error = validateField(field, initialData[field])
    return !error
  })

  useEffect(() => {
    // Update errors when data changes
    const newErrors: Record<string, string> = {}
    Object.keys(schema).forEach(field => {
      const error = validateField(field, initialData[field])
      if (error && touched[field]) {
        newErrors[field] = error
      }
    })
    setErrors(newErrors)
  }, [initialData, touched])

  return {
    isValid,
    errors,
    touched,
    validateField,
    touchField,
    reset
  }
}

// Validation patterns
export const ValidationPatterns = {
  DNI: /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i,
  NIE: /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i,
  IBAN: /^ES[0-9]{2}[0-9]{4}[0-9]{4}[0-9]{2}[0-9]{10}$/,
  PHONE: /^(\+34|0034|34)?[6-9][0-9]{8}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
}

// Custom validators
export const CustomValidators = {
  dniNie: (value: string): string | null => {
    if (!value) return null
    const cleanValue = value.toUpperCase().replace(/[^0-9TRWAGMYFPDXBNJZSQVHLCKEXYZ]/g, '')
    
    if (ValidationPatterns.DNI.test(cleanValue) || ValidationPatterns.NIE.test(cleanValue)) {
      return null
    }
    return 'DNI/NIE no válido'
  },

  iban: (value: string): string | null => {
    if (!value) return null
    const cleanValue = value.replace(/\s/g, '').toUpperCase()
    
    if (!ValidationPatterns.IBAN.test(cleanValue)) {
      return 'IBAN español no válido'
    }
    return null
  },

  phone: (value: string): string | null => {
    if (!value) return null
    const cleanValue = value.replace(/[\s-]/g, '')
    
    if (!ValidationPatterns.PHONE.test(cleanValue)) {
      return 'Número de teléfono español no válido'
    }
    return null
  }
}