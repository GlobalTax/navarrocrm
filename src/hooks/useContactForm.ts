
import { useContactFormState } from './contacts/useContactFormState'
import { useContactFormSubmit } from './contacts/useContactFormSubmit'
import { createLogger } from '@/utils/logger'
import { createError, handleError } from '@/utils/errorHandler'
import type { Contact } from './useContacts'
import type { CompanyData } from './useCompanyLookup'

interface ContactFormConfig {
  contact: Contact | null
  onClose: () => void
  onCompanyFound?: (company: CompanyData) => void
  onSuccess?: (contact: Contact) => void
  customValidation?: (contact: Contact) => boolean
}

interface ContactFormReturn {
  form: ReturnType<typeof useContactFormState>['form']
  isEditing: boolean
  isCompanyDataLoaded: boolean
  handleCompanyFound: (company: CompanyData) => void
  submitForm: ReturnType<typeof useContactFormSubmit>['submitForm']
  isValid: boolean
  errors: Record<string, string>
}

export const useContactForm = (contact: Contact | null, onClose: () => void): ContactFormReturn => {
  const logger = createLogger('useContactForm')
  
  const config: ContactFormConfig = {
    contact,
    onClose
  }

  // Validación de parámetros
  if (typeof onClose !== 'function') {
    throw createError('Invalid onClose parameter', {
      severity: 'high',
      userMessage: 'Error en la configuración del formulario',
      technicalMessage: 'onClose must be a function'
    })
  }

  const { form, isEditing, isCompanyDataLoaded, handleCompanyFound: originalHandleCompanyFound } = useContactFormState(contact)
  
  const enhancedHandleCompanyFound = (companyData: CompanyData) => {
    try {
      if (!companyData || typeof companyData !== 'object') {
        throw createError('Invalid company data', {
          severity: 'medium',
          userMessage: 'Los datos de la empresa no son válidos',
          technicalMessage: 'CompanyData must be a valid object'
        })
      }

      if (!companyData.name || !companyData.nif) {
        throw createError('Incomplete company data', {
          severity: 'medium',
          userMessage: 'Los datos de la empresa están incompletos',
          technicalMessage: 'CompanyData missing required fields: name or nif'
        })
      }

      originalHandleCompanyFound(companyData)
      
      if (config.onCompanyFound) {
        config.onCompanyFound(companyData)
      }

      logger.info('Company data processed successfully', {
        metadata: {
          companyName: companyData.name,
          companyNif: companyData.nif,
          companyStatus: companyData.status
        }
      })

    } catch (error) {
      logger.error('Error processing company data', {
        error,
        metadata: {
          companyData: companyData ? { name: companyData.name, nif: companyData.nif } : null
        }
      })
      handleError(error, 'useContactForm-companyFound')
    }
  }

  const originalSubmit = useContactFormSubmit(contact, onClose)
  
  const enhancedSubmitForm = async (data: any) => {
    try {
      await originalSubmit.submitForm(data)
      
      if (config.onSuccess && contact) {
        config.onSuccess(contact)
      }
      
      logger.info('Contact form submitted successfully', {
        metadata: {
          operation: isEditing ? 'update' : 'create',
          contactId: contact?.id,
          contactName: data.name,
          relationshipType: data.relationship_type
        }
      })
      
    } catch (error) {
      logger.error('Contact form submission failed', {
        error,
        metadata: {
          operation: isEditing ? 'update' : 'create',
          contactId: contact?.id,
          formData: { 
            name: data.name, 
            client_type: data.client_type,
            relationship_type: data.relationship_type 
          }
        }
      })
      throw error
    }
  }

  const isValid = form.formState.isValid && !form.formState.isSubmitting
  const errors = Object.keys(form.formState.errors).reduce((acc, key) => {
    const error = form.formState.errors[key]
    acc[key] = error?.message || 'Error de validación'
    return acc
  }, {} as Record<string, string>)

  return {
    form,
    isEditing,
    isCompanyDataLoaded,
    handleCompanyFound: enhancedHandleCompanyFound,
    submitForm: enhancedSubmitForm,
    isValid,
    errors
  }
}
