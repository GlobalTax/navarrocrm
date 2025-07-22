import { useClientFormState } from './clients/useClientFormState'
import { useClientFormSubmit } from './clients/useClientFormSubmit'
import { createLogger } from '@/utils/logger'
import { createError, handleError } from '@/utils/errorHandler'
import type { Client } from './clients/clientFormTypes'
import type { CompanyData } from './useCompanyLookup'
import type { SubmissionResult } from '@/types/shared/formTypes'

interface ClientFormConfig {
  client: Client | null
  onClose: () => void
  onCompanyFound?: (company: CompanyData) => void
  onSuccess?: (client: Client) => void
  customValidation?: (client: Client) => boolean
}

interface ClientFormReturn {
  form: ReturnType<typeof useClientFormState>['form']
  isEditing: boolean
  isCompanyDataLoaded: boolean
  handleCompanyFound: (company: CompanyData) => void
  submitForm: ReturnType<typeof useClientFormSubmit>['submitForm']
  isValid: boolean
  errors: Record<string, string>
}

export const useClientForm = (config: ClientFormConfig | Client | null, onClose?: () => void): ClientFormReturn => {
  const logger = createLogger('useClientForm')
  
  let normalizedConfig: ClientFormConfig
  
  if (typeof config === 'object' && config !== null && 'client' in config) {
    normalizedConfig = config as ClientFormConfig
  } else {
    if (typeof onClose !== 'function') {
      throw createError('Invalid onClose parameter', {
        severity: 'high',
        userMessage: 'Error en la configuración del formulario',
        technicalMessage: 'onClose must be a function when using legacy API'
      })
    }
    
    normalizedConfig = {
      client: config as Client | null,
      onClose
    }
  }

  // Validación exhaustiva de parámetros
  try {
    if (typeof normalizedConfig.onClose !== 'function') {
      throw createError('Invalid onClose callback', {
        severity: 'high',
        userMessage: 'Error en la configuración del formulario',
        technicalMessage: 'onClose must be a function'
      })
    }

    if (normalizedConfig.client !== null && typeof normalizedConfig.client !== 'object') {
      throw createError('Invalid client parameter', {
        severity: 'high',
        userMessage: 'Los datos del cliente no son válidos',
        technicalMessage: 'client must be null or a valid Client object'
      })
    }

    // Validación para clientes existentes
    if (normalizedConfig.client) {
      const requiredFields = ['id', 'name', 'relationship_type'] as const
      for (const field of requiredFields) {
        if (!normalizedConfig.client[field]) {
          throw createError(`Missing required field: ${field}`, {
            severity: 'medium',
            userMessage: `Faltan datos requeridos del cliente: ${field}`,
            technicalMessage: `Client object missing required field: ${field}`
          })
        }
      }

      // Validar relationship_type
      const validRelationshipTypes = ['prospecto', 'cliente', 'ex_cliente']
      if (!validRelationshipTypes.includes(normalizedConfig.client.relationship_type)) {
        throw createError('Invalid relationship_type', {
          severity: 'medium',
          userMessage: 'Tipo de relación del cliente no válido',
          technicalMessage: `relationship_type must be one of: ${validRelationshipTypes.join(', ')}`
        })
      }

      // Validación personalizada si está definida
      if (normalizedConfig.customValidation && !normalizedConfig.customValidation(normalizedConfig.client)) {
        throw createError('Custom validation failed', {
          severity: 'medium',
          userMessage: 'Los datos del cliente no pasan la validación personalizada',
          technicalMessage: 'Client failed custom validation check'
        })
      }
    }

    // Validar callbacks opcionales
    if (normalizedConfig.onCompanyFound && typeof normalizedConfig.onCompanyFound !== 'function') {
      logger.warn('Invalid onCompanyFound callback provided', {
        metadata: { 
          onCompanyFoundType: typeof normalizedConfig.onCompanyFound 
        }
      })
      normalizedConfig.onCompanyFound = undefined
    }

    if (normalizedConfig.onSuccess && typeof normalizedConfig.onSuccess !== 'function') {
      logger.warn('Invalid onSuccess callback provided', {
        metadata: { 
          onSuccessType: typeof normalizedConfig.onSuccess 
        }
      })
      normalizedConfig.onSuccess = undefined
    }

    logger.info('useClientForm initialized', {
      metadata: {
        isEditing: !!normalizedConfig.client,
        clientId: normalizedConfig.client?.id,
        clientName: normalizedConfig.client?.name,
        relationshipType: normalizedConfig.client?.relationship_type,
        hasCompanyFoundCallback: !!normalizedConfig.onCompanyFound,
        hasSuccessCallback: !!normalizedConfig.onSuccess,
        hasCustomValidation: !!normalizedConfig.customValidation
      }
    })

  } catch (error) {
    handleError(error, 'useClientForm-validation')
    throw error // Re-throw para que el componente pueda manejar el error
  }

  const { form, isEditing, isCompanyDataLoaded, handleCompanyFound: originalHandleCompanyFound } = useClientFormState(normalizedConfig.client)
  
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
      
      if (normalizedConfig.onCompanyFound) {
        normalizedConfig.onCompanyFound(companyData)
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
      handleError(error, 'useClientForm-companyFound')
    }
  }

  const originalSubmit = useClientFormSubmit(normalizedConfig.client, normalizedConfig.onClose)
  
  const enhancedSubmitForm = async (data: any): Promise<SubmissionResult> => {
    try {
      const result = await originalSubmit.submitForm(data)
      
      if (normalizedConfig.onSuccess && normalizedConfig.client) {
        normalizedConfig.onSuccess(normalizedConfig.client)
      }
      
      logger.info('Client form submitted successfully', {
        metadata: {
          operation: isEditing ? 'update' : 'create',
          clientId: normalizedConfig.client?.id,
          clientName: data.name,
          relationshipType: data.relationship_type
        }
      })
      
      return result
      
    } catch (error) {
      logger.error('Client form submission failed', {
        error,
        metadata: {
          operation: isEditing ? 'update' : 'create',
          clientId: normalizedConfig.client?.id,
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

export const useCompanyClientForm = (
  onClose: () => void,
  onCompanyFound?: (company: CompanyData) => void
) => {
  return useClientForm({
    client: null,
    onClose,
    onCompanyFound,
    customValidation: (client) => {
      return client.client_type === 'empresa' && 
             client.dni_nif?.length >= 8 &&
             client.name.length >= 2
    }
  })
}
