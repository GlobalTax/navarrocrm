
import { useContactFormState } from './contacts/useContactFormState'
import { useContactFormSubmit } from './contacts/useContactFormSubmit'
import { createLogger } from '@/utils/logger'
import { createError, handleError } from '@/utils/errorHandler'
import type { Contact } from './contacts/contactFormTypes'
import type { CompanyData } from './useCompanyLookup'

/**
 * Configuración para el hook useContactForm
 */
interface ContactFormConfig {
  /** Contacto a editar (null para crear nuevo) */
  contact: Contact | null
  /** Función llamada al cerrar el formulario */
  onClose: () => void
  /** Callback ejecutado cuando se encuentra una empresa */
  onCompanyFound?: (company: CompanyData) => void
  /** Callback ejecutado después de envío exitoso */
  onSuccess?: (contact: Contact) => void
  /** Validación adicional personalizada */
  customValidation?: (contact: Contact) => boolean
  /** Configuración de validaciones específicas */
  validationRules?: {
    requireEmail?: boolean
    requirePhone?: boolean
    minNameLength?: number
    allowedRelationshipTypes?: Contact['relationship_type'][]
  }
}

/**
 * Valor de retorno del hook useContactForm
 */
interface ContactFormReturn {
  /** Instancia del formulario react-hook-form */
  form: ReturnType<typeof useContactFormState>['form']
  /** Indica si está en modo edición */
  isEditing: boolean
  /** Indica si se han cargado datos de empresa */
  isCompanyDataLoaded: boolean
  /** Función para manejar empresa encontrada */
  handleCompanyFound: (company: CompanyData) => void
  /** Función para enviar el formulario */
  onSubmit: ReturnType<typeof useContactFormSubmit>['onSubmit']
  /** Estado de validación del formulario */
  isValid: boolean
  /** Errores de validación actuales */
  errors: Record<string, string>
  /** Función para validar contacto manualmente */
  validateContact: (contact: Partial<Contact>) => { isValid: boolean; errors: string[] }
}

/**
 * Hook principal para gestionar formularios de contactos.
 * Proporciona funcionalidad completa para crear y editar contactos con validación avanzada,
 * búsqueda de empresas, gestión de relaciones y manejo de errores robusto.
 * 
 * @param config - Configuración del formulario de contacto
 * @returns Objeto con form, estado, funciones de gestión y validación
 * 
 * @example
 * ```tsx
 * const { 
 *   form, 
 *   isEditing, 
 *   handleCompanyFound, 
 *   onSubmit,
 *   isValid,
 *   validateContact
 * } = useContactForm({
 *   contact: selectedContact,
 *   onClose: () => setDialogOpen(false),
 *   onCompanyFound: (company) => {
 *     setCompanyData(company)
 *     toast.success(`Empresa ${company.name} encontrada`)
 *   },
 *   onSuccess: (contact) => {
 *     toast.success(`Contacto ${contact.name} guardado exitosamente`)
 *     refreshContactsList()
 *   },
 *   validationRules: {
 *     requireEmail: true,
 *     minNameLength: 3,
 *     allowedRelationshipTypes: ['prospecto', 'cliente']
 *   }
 * })
 * 
 * return (
 *   <Form {...form}>
 *     <form onSubmit={form.handleSubmit(onSubmit)}>
 *       <CompanyLookupSection onCompanyFound={handleCompanyFound} />
 *       <ContactFormTabs form={form} />
 *       <Button type="submit" disabled={!isValid}>
 *         {isEditing ? 'Actualizar' : 'Crear'} Contacto
 *       </Button>
 *     </form>
 *   </Form>
 * )
 * ```
 * 
 * @throws {Error} Si los parámetros no son válidos
 */
export const useContactForm = (config: ContactFormConfig | Contact | null, onClose?: () => void): ContactFormReturn => {
  const logger = createLogger('useContactForm')
  
  // Normalizar parámetros para backward compatibility
  let normalizedConfig: ContactFormConfig
  
  if (typeof config === 'object' && config !== null && 'contact' in config) {
    // Nueva API con objeto de configuración
    normalizedConfig = config as ContactFormConfig
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
      contact: config as Contact | null,
      onClose,
      validationRules: {
        requireEmail: false,
        requirePhone: false,
        minNameLength: 2,
        allowedRelationshipTypes: ['prospecto', 'cliente', 'ex_cliente']
      }
    }
  }

  // Configurar reglas de validación por defecto
  const defaultValidationRules = {
    requireEmail: false,
    requirePhone: false,
    minNameLength: 2,
    allowedRelationshipTypes: ['prospecto', 'cliente', 'ex_cliente'] as Contact['relationship_type'][]
  }
  
  normalizedConfig.validationRules = {
    ...defaultValidationRules,
    ...normalizedConfig.validationRules
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

    if (normalizedConfig.contact !== null && typeof normalizedConfig.contact !== 'object') {
      throw createError('Invalid contact parameter', {
        severity: 'high',
        userMessage: 'Los datos del contacto no son válidos',
        technicalMessage: 'contact must be null or a valid Contact object'
      })
    }

    // Validación para contactos existentes
    if (normalizedConfig.contact) {
      const requiredFields = ['id', 'name', 'relationship_type'] as const
      for (const field of requiredFields) {
        if (!normalizedConfig.contact[field]) {
          throw createError(`Missing required field: ${field}`, {
            severity: 'medium',
            userMessage: `Faltan datos requeridos del contacto: ${field}`,
            technicalMessage: `Contact object missing required field: ${field}`
          })
        }
      }

      // Validar relationship_type
      const validRelationshipTypes = normalizedConfig.validationRules.allowedRelationshipTypes
      if (!validRelationshipTypes.includes(normalizedConfig.contact.relationship_type)) {
        throw createError('Invalid relationship_type', {
          severity: 'medium',
          userMessage: 'Tipo de relación del contacto no válido',
          technicalMessage: `relationship_type must be one of: ${validRelationshipTypes.join(', ')}`
        })
      }

      // Validación de longitud de nombre
      if (normalizedConfig.contact.name.length < normalizedConfig.validationRules.minNameLength) {
        throw createError('Name too short', {
          severity: 'medium',
          userMessage: `El nombre debe tener al menos ${normalizedConfig.validationRules.minNameLength} caracteres`,
          technicalMessage: `Name length ${normalizedConfig.contact.name.length} is below minimum ${normalizedConfig.validationRules.minNameLength}`
        })
      }

      // Validación de email si es requerido
      if (normalizedConfig.validationRules.requireEmail && !normalizedConfig.contact.email) {
        throw createError('Email required', {
          severity: 'medium',
          userMessage: 'El email es requerido para este contacto',
          technicalMessage: 'Email is required by validation rules but not provided'
        })
      }

      // Validación de teléfono si es requerido
      if (normalizedConfig.validationRules.requirePhone && !normalizedConfig.contact.phone) {
        throw createError('Phone required', {
          severity: 'medium',
          userMessage: 'El teléfono es requerido para este contacto',
          technicalMessage: 'Phone is required by validation rules but not provided'
        })
      }

      // Validación personalizada si está definida
      if (normalizedConfig.customValidation && !normalizedConfig.customValidation(normalizedConfig.contact)) {
        throw createError('Custom validation failed', {
          severity: 'medium',
          userMessage: 'Los datos del contacto no pasan la validación personalizada',
          technicalMessage: 'Contact failed custom validation check'
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

    logger.info('useContactForm initialized', {
      metadata: {
        isEditing: !!normalizedConfig.contact,
        contactId: normalizedConfig.contact?.id,
        contactName: normalizedConfig.contact?.name,
        relationshipType: normalizedConfig.contact?.relationship_type,
        validationRules: normalizedConfig.validationRules,
        hasCompanyFoundCallback: !!normalizedConfig.onCompanyFound,
        hasSuccessCallback: !!normalizedConfig.onSuccess,
        hasCustomValidation: !!normalizedConfig.customValidation
      }
    })

  } catch (error) {
    handleError(error, 'useContactForm-validation')
    throw error // Re-throw para que el componente pueda manejar el error
  }

  // Función de validación manual
  const validateContact = (contact: Partial<Contact>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    const rules = normalizedConfig.validationRules!

    if (!contact.name || contact.name.length < rules.minNameLength) {
      errors.push(`El nombre debe tener al menos ${rules.minNameLength} caracteres`)
    }

    if (rules.requireEmail && !contact.email) {
      errors.push('El email es requerido')
    }

    if (rules.requirePhone && !contact.phone) {
      errors.push('El teléfono es requerido')
    }

    if (contact.relationship_type && !rules.allowedRelationshipTypes.includes(contact.relationship_type)) {
      errors.push(`Tipo de relación no válido: ${contact.relationship_type}`)
    }

    if (contact.email && contact.email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(contact.email)) {
        errors.push('El formato del email no es válido')
      }
    }

    if (contact.phone && contact.phone.length > 0) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/
      if (!phoneRegex.test(contact.phone)) {
        errors.push('El formato del teléfono no es válido')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Inicializar hooks de estado y envío
  const { form, isEditing, isCompanyDataLoaded, handleCompanyFound: originalHandleCompanyFound } = useContactFormState(normalizedConfig.contact)
  
  // Envolver handleCompanyFound con callback personalizado y validación
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

      const requiredCompanyFields = ['name', 'nif']
      for (const field of requiredCompanyFields) {
        if (!companyData[field as keyof CompanyData]) {
          throw createError(`Missing company field: ${field}`, {
            severity: 'medium',
            userMessage: `Faltan datos de la empresa: ${field}`,
            technicalMessage: `CompanyData missing required field: ${field}`
          })
        }
      }

      // Validar formato NIF básico
      if (companyData.nif && companyData.nif.length < 8) {
        logger.warn('Company NIF may be invalid', {
          metadata: { nif: companyData.nif, length: companyData.nif.length }
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
          companyData: companyData ? { 
            name: companyData.name, 
            nif: companyData.nif,
            status: companyData.status 
          } : null
        }
      })
      handleError(error, 'useContactForm-companyFound')
    }
  }

  // Envolver onSubmit con validación adicional y callback de éxito
  const originalSubmit = useContactFormSubmit(normalizedConfig.contact, normalizedConfig.onClose)
  
  const enhancedOnSubmit = async (data: any) => {
    try {
      // Validación pre-envío
      const validation = validateContact(data)
      if (!validation.isValid) {
        throw createError('Form validation failed', {
          severity: 'medium',
          userMessage: `Errores de validación: ${validation.errors.join(', ')}`,
          technicalMessage: `Validation errors: ${validation.errors.join('; ')}`
        })
      }

      await originalSubmit.onSubmit(data)
      
      // Ejecutar callback de éxito si está definido
      if (normalizedConfig.onSuccess) {
        // Crear objeto contacto para el callback
        const contactForCallback: Contact = {
          id: normalizedConfig.contact?.id || 'new',
          name: data.name,
          relationship_type: data.relationship_type,
          ...data
        }
        normalizedConfig.onSuccess(contactForCallback)
      }
      
      logger.info('Contact form submitted successfully', {
        metadata: {
          operation: isEditing ? 'update' : 'create',
          contactId: normalizedConfig.contact?.id,
          contactName: data.name,
          relationshipType: data.relationship_type,
          hasEmail: !!data.email,
          hasPhone: !!data.phone
        }
      })
      
    } catch (error) {
      logger.error('Contact form submission failed', {
        error,
        metadata: {
          operation: isEditing ? 'update' : 'create',
          contactId: normalizedConfig.contact?.id,
          formData: { 
            name: data.name, 
            client_type: data.client_type,
            relationship_type: data.relationship_type,
            email: data.email ? 'provided' : 'empty',
            phone: data.phone ? 'provided' : 'empty'
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
    errors,
    validateContact
  }
}

/**
 * Hook especializado para crear contactos empresariales con validación estricta
 * 
 * @param onClose - Callback al cerrar el formulario
 * @param onCompanyFound - Callback cuando se encuentra una empresa
 * @returns Hook configurado para contactos empresariales
 */
export const useBusinessContactForm = (
  onClose: () => void,
  onCompanyFound?: (company: CompanyData) => void
) => {
  return useContactForm({
    contact: null,
    onClose,
    onCompanyFound,
    validationRules: {
      requireEmail: true,
      requirePhone: false,
      minNameLength: 3,
      allowedRelationshipTypes: ['prospecto', 'cliente']
    },
    customValidation: (contact) => {
      // Validaciones específicas para contactos empresariales
      return contact.client_type === 'empresa' && 
             contact.email !== undefined &&
             contact.name.length >= 3
    }
  })
}

/**
 * Hook especializado para contactos particulares con validación flexible
 * 
 * @param onClose - Callback al cerrar el formulario
 * @returns Hook configurado para contactos particulares
 */
export const usePersonalContactForm = (onClose: () => void) => {
  return useContactForm({
    contact: null,
    onClose,
    validationRules: {
      requireEmail: false,
      requirePhone: true,
      minNameLength: 2,
      allowedRelationshipTypes: ['prospecto', 'cliente', 'ex_cliente']
    },
    customValidation: (contact) => {
      // Validaciones específicas para contactos particulares
      return ['particular', 'autonomo'].includes(contact.client_type || '') &&
             contact.name.length >= 2
    }
  })
}
