
import { useClientFormState } from './clients/useClientFormState'
import { useClientFormSubmit } from './clients/useClientFormSubmit'
import { createLogger } from '@/utils/logger'
import { createError, handleError } from '@/utils/errorHandler'
import type { Client } from './clients/clientFormTypes'
import type { CompanyData } from './useCompanyLookup'

/**
 * Configuración para el hook useClientForm
 */
interface ClientFormConfig {
  /** Cliente a editar (null para crear nuevo) */
  client: Client | null
  /** Función llamada al cerrar el formulario */
  onClose: () => void
  /** Callback ejecutado cuando se encuentra una empresa */
  onCompanyFound?: (company: CompanyData) => void
  /** Callback ejecutado después de envío exitoso */
  onSuccess?: (client: Client) => void
  /** Validación adicional personalizada */
  customValidation?: (client: Client) => boolean
}

/**
 * Valor de retorno del hook useClientForm
 */
interface ClientFormReturn {
  /** Instancia del formulario react-hook-form */
  form: ReturnType<typeof useClientFormState>['form']
  /** Indica si está en modo edición */
  isEditing: boolean
  /** Indica si se han cargado datos de empresa */
  isCompanyDataLoaded: boolean
  /** Función para manejar empresa encontrada */
  handleCompanyFound: (company: CompanyData) => void
  /** Función para enviar el formulario */
  onSubmit: ReturnType<typeof useClientFormSubmit>['onSubmit']
  /** Estado de validación del formulario */
  isValid: boolean
  /** Errores de validación actuales */
  errors: Record<string, string>
}

/**
 * Hook principal para gestionar formularios de clientes.
 * Proporciona funcionalidad completa para crear y editar clientes con validación,
 * búsqueda de empresas y manejo de errores robusto.
 * 
 * @param config - Configuración del formulario de cliente
 * @returns Objeto con form, estado y funciones de gestión
 * 
 * @example
 * ```tsx
 * const { 
 *   form, 
 *   isEditing, 
 *   handleCompanyFound, 
 *   onSubmit,
 *   isValid 
 * } = useClientForm({
 *   client: selectedClient,
 *   onClose: () => setDialogOpen(false),
 *   onCompanyFound: (company) => {
 *     console.log('Empresa encontrada:', company.name)
 *   },
 *   onSuccess: (client) => {
 *     toast.success(`Cliente ${client.name} guardado exitosamente`)
 *   }
 * })
 * 
 * return (
 *   <Form {...form}>
 *     <form onSubmit={form.handleSubmit(onSubmit)}>
 *       <CompanyLookupSection onCompanyFound={handleCompanyFound} />
 *       <ClientFormTabs form={form} />
 *       <Button type="submit" disabled={!isValid}>
 *         {isEditing ? 'Actualizar' : 'Crear'} Cliente
 *       </Button>
 *     </form>
 *   </Form>
 * )
 * ```
 * 
 * @throws {Error} Si los parámetros no son válidos
 */
export const useClientForm = (config: ClientFormConfig | Client | null, onClose?: () => void): ClientFormReturn => {
  const logger = createLogger('useClientForm')
  
  // Normalizar parámetros para backward compatibility
  let normalizedConfig: ClientFormConfig
  
  if (typeof config === 'object' && config !== null && 'client' in config) {
    // Nueva API con objeto de configuración
    normalizedConfig = config as ClientFormConfig
  } else {
    // API legacy con parámetros separados
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

  // Inicializar hooks de estado y envío
  const { form, isEditing, isCompanyDataLoaded, handleCompanyFound: originalHandleCompanyFound } = useClientFormState(normalizedConfig.client)
  
  // Envolver handleCompanyFound con callback personalizado
  const enhancedHandleCompanyFound = (companyData: CompanyData) => {
    try {
      // Validar datos de empresa
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

      // Ejecutar handler original
      originalHandleCompanyFound(companyData)
      
      // Ejecutar callback personalizado si existe
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

  // Envolver onSubmit con callback de éxito
  const originalSubmit = useClientFormSubmit(normalizedConfig.client, normalizedConfig.onClose)
  
  const enhancedOnSubmit = async (data: any) => {
    try {
      await originalSubmit.onSubmit(data)
      
      // Ejecutar callback de éxito si está definido
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

  // Calcular estado de validación
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
    onSubmit: enhancedOnSubmit,
    isValid,
    errors
  }
}

/**
 * Hook especializado para crear nuevos clientes empresariales
 * 
 * @param onClose - Callback al cerrar el formulario
 * @param onCompanyFound - Callback cuando se encuentra una empresa
 * @returns Hook configurado para creación de clientes empresariales
 */
export const useCompanyClientForm = (
  onClose: () => void,
  onCompanyFound?: (company: CompanyData) => void
) => {
  return useClientForm({
    client: null,
    onClose,
    onCompanyFound,
    customValidation: (client) => {
      // Validaciones específicas para clientes empresariales
      return client.client_type === 'empresa' && 
             client.dni_nif?.length >= 8 &&
             client.name.length >= 2
    }
  })
}
