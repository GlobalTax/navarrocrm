
import { useState, useCallback } from 'react'
import type { BulkUploadValidationResult, ContactValidationData, ValidationResult } from '@/types/forms'
import type { ValidationError } from '@/types/interfaces'

interface BulkUploadValidators {
  validateCsvFile: (file: File) => Promise<ValidationResult>
  validateContactData: (data: ContactValidationData[]) => BulkUploadValidationResult
  validateSingleContact: (contact: ContactValidationData) => ValidationError[]
  isValidEmail: (email: string) => boolean
  isValidPhone: (phone: string) => boolean
  isValidNif: (nif: string) => boolean
}

export const useBulkUploadValidators = (): BulkUploadValidators => {
  const isValidEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }, [])

  const isValidPhone = useCallback((phone: string): boolean => {
    const phoneRegex = /^(\+34|0034|34)?[6-9]\d{8}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }, [])

  const isValidNif = useCallback((nif: string): boolean => {
    const nifRegex = /^[0-9]{8}[A-Z]$/
    const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
    
    const cleanNif = nif.toUpperCase().replace(/[\s-]/g, '')
    return nifRegex.test(cleanNif) || cifRegex.test(cleanNif) || nieRegex.test(cleanNif)
  }, [])

  const validateSingleContact = useCallback((contact: ContactValidationData): ValidationError[] => {
    const errors: ValidationError[] = []

    if (!contact.name || contact.name.trim().length < 2) {
      errors.push({
        row: 0, // Will be set by caller
        field: 'name',
        message: 'El nombre debe tener al menos 2 caracteres'
      })
    }

    if (contact.email && !isValidEmail(contact.email)) {
      errors.push({
        row: 0,
        field: 'email',
        message: 'El formato del email no es válido'
      })
    }

    if (contact.phone && !isValidPhone(contact.phone)) {
      errors.push({
        row: 0,
        field: 'phone',
        message: 'El formato del teléfono no es válido'
      })
    }

    if (contact.dni_nif && !isValidNif(contact.dni_nif)) {
      errors.push({
        row: 0,
        field: 'dni_nif',
        message: 'El formato del DNI/NIF/CIF no es válido'
      })
    }

    return errors
  }, [isValidEmail, isValidPhone, isValidNif])

  const validateContactData = useCallback((data: ContactValidationData[]): BulkUploadValidationResult => {
    const result: BulkUploadValidationResult = {
      totalRows: data.length,
      validRows: 0,
      invalidRows: 0,
      errors: [],
      warnings: []
    }

    data.forEach((contact, index) => {
      const rowNumber = index + 1
      const contactErrors = validateSingleContact(contact)
      
      if (contactErrors.length > 0) {
        result.invalidRows++
        contactErrors.forEach(error => {
          result.errors.push({
            ...error,
            row: rowNumber,
            value: (contact as any)[error.field]
          })
        })
      } else {
        result.validRows++
      }

      // Add warnings for missing optional but recommended fields
      if (!contact.email && !contact.phone) {
        result.warnings.push({
          row: rowNumber,
          field: 'contact',
          message: 'Se recomienda incluir email o teléfono para contacto',
          value: null
        })
      }
    })

    return result
  }, [validateSingleContact])

  const validateCsvFile = useCallback(async (file: File): Promise<ValidationResult> => {
    const errors: ValidationError[] = []
    const warnings: string[] = []

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      errors.push({
        row: 0,
        field: 'file',
        message: 'El archivo debe ser de tipo CSV'
      })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      errors.push({
        row: 0,
        field: 'file',
        message: 'El archivo no puede superar los 10MB'
      })
    }

    // Additional validations could be added here
    if (file.size === 0) {
      errors.push({
        row: 0,
        field: 'file',
        message: 'El archivo está vacío'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }, [])

  return {
    validateCsvFile,
    validateContactData,
    validateSingleContact,
    isValidEmail,
    isValidPhone,
    isValidNif
  }
}
