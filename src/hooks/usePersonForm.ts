
import { usePersonFormState } from './persons/usePersonFormState'
import { usePersonFormSubmit } from './persons/usePersonFormSubmit'
import { createLogger } from '@/utils/logger'
import { createError, handleError } from '@/utils/errorHandler'
import type { Person } from './usePersons'

/**
 * Configuración para el hook usePersonForm
 */
interface PersonFormConfig {
  /** Persona a editar (null para crear nueva) */
  person: Person | null
  /** Función llamada al cerrar el formulario */
  onClose: () => void
  /** Validación adicional personalizada */
  customValidation?: (person: Person) => boolean
  /** Callback ejecutado después de envío exitoso */
  onSuccess?: (person: Person) => void
}

/**
 * Valor de retorno del hook usePersonForm
 */
interface PersonFormReturn {
  /** Instancia del formulario react-hook-form */
  form: ReturnType<typeof usePersonFormState>['form']
  /** Indica si está en modo edición */
  isEditing: boolean
  /** Función para enviar el formulario */
  onSubmit: ReturnType<typeof usePersonFormSubmit>['onSubmit']
  /** Estado de validación del formulario */
  isValid: boolean
  /** Errores de validación actuales */
  errors: Record<string, string>
}

/**
 * Hook principal para gestionar formularios de personas físicas.
 * Combina estado del formulario y lógica de envío con validación robusta.
 * 
 * @param config - Configuración del formulario de persona
 * @returns Objeto con form, estado y funciones de envío
 * 
 * @example
 * ```tsx
 * const { form, isEditing, onSubmit, isValid } = usePersonForm({
 *   person: selectedPerson,
 *   onClose: () => setDialogOpen(false),
 *   onSuccess: (person) => toast.success(`Persona ${person.name} guardada`)
 * })
 * 
 * return (
 *   <Form {...form}>
 *     <form onSubmit={form.handleSubmit(onSubmit)}>
 *       <PersonFormTabs form={form} />
 *       <Button type="submit" disabled={!isValid}>
 *         {isEditing ? 'Actualizar' : 'Crear'} Persona
 *       </Button>
 *     </form>
 *   </Form>
 * )
 * ```
 * 
 * @throws {Error} Si los parámetros no son válidos
 */
export const usePersonForm = (config: PersonFormConfig | Person | null, onClose?: () => void): PersonFormReturn => {
  const logger = createLogger('usePersonForm')
  
  // Normalizar parámetros para backward compatibility
  let normalizedConfig: PersonFormConfig
  
  if (typeof config === 'object' && config !== null && 'person' in config) {
    // Nueva API con objeto de configuración
    normalizedConfig = config as PersonFormConfig
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
      person: config as Person | null,
      onClose
    }
  }

  // Validación de parámetros
  try {
    if (typeof normalizedConfig.onClose !== 'function') {
      throw createError('Invalid onClose callback', {
        severity: 'high',
        userMessage: 'Error en la configuración del formulario',
        technicalMessage: 'onClose must be a function'
      })
    }

    if (normalizedConfig.person !== null && typeof normalizedConfig.person !== 'object') {
      throw createError('Invalid person parameter', {
        severity: 'high',
        userMessage: 'Los datos de la persona no son válidos',
        technicalMessage: 'person must be null or a valid Person object'
      })
    }

    // Validación adicional para personas existentes
    if (normalizedConfig.person) {
      const requiredFields = ['id', 'name'] as const
      for (const field of requiredFields) {
        if (!normalizedConfig.person[field]) {
          throw createError(`Missing required field: ${field}`, {
            severity: 'medium',
            userMessage: `Faltan datos requeridos de la persona: ${field}`,
            technicalMessage: `Person object missing required field: ${field}`
          })
        }
      }

      // Validación personalizada si está definida
      if (normalizedConfig.customValidation && !normalizedConfig.customValidation(normalizedConfig.person)) {
        throw createError('Custom validation failed', {
          severity: 'medium',
          userMessage: 'Los datos de la persona no pasan la validación personalizada',
          technicalMessage: 'Person failed custom validation check'
        })
      }
    }

    logger.info('usePersonForm initialized', {
      metadata: {
        isEditing: !!normalizedConfig.person,
        personId: normalizedConfig.person?.id,
        personName: normalizedConfig.person?.name,
        hasCustomValidation: !!normalizedConfig.customValidation,
        hasSuccessCallback: !!normalizedConfig.onSuccess
      }
    })

  } catch (error) {
    handleError(error, 'usePersonForm-validation')
    throw error // Re-throw para que el componente pueda manejar el error
  }

  // Inicializar hooks de estado y envío
  const { form, isEditing } = usePersonFormState(normalizedConfig.person)
  
  // Envolver onSubmit con callback de éxito
  const originalSubmit = usePersonFormSubmit(normalizedConfig.person, normalizedConfig.onClose)
  
  const enhancedOnSubmit = async (data: any) => {
    try {
      await originalSubmit.onSubmit(data)
      
      // Ejecutar callback de éxito si está definido
      if (normalizedConfig.onSuccess && normalizedConfig.person) {
        normalizedConfig.onSuccess(normalizedConfig.person)
      }
      
      logger.info('Person form submitted successfully', {
        metadata: {
          operation: isEditing ? 'update' : 'create',
          personId: normalizedConfig.person?.id,
          personName: data.name
        }
      })
      
    } catch (error) {
      logger.error('Person form submission failed', {
        error,
        metadata: {
          operation: isEditing ? 'update' : 'create',
          personId: normalizedConfig.person?.id,
          formData: { name: data.name, client_type: data.client_type }
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
    onSubmit: enhancedOnSubmit,
    isValid,
    errors
  }
}

/**
 * Hook especializado para crear nuevas personas con validación previa
 * 
 * @param onClose - Callback al cerrar el formulario
 * @param initialData - Datos iniciales opcionales
 * @returns Hook configurado para creación
 */
export const usePersonCreationForm = (
  onClose: () => void,
  initialData?: Partial<Person>
) => {
  const logger = createLogger('usePersonCreationForm')
  
  return usePersonForm({
    person: null,
    onClose,
    customValidation: (person) => {
      // Validaciones específicas para creación
      return person.name.length >= 2 && person.client_type !== undefined
    },
    onSuccess: (person) => {
      logger.info('New person created successfully', {
        metadata: { personId: person.id, personName: person.name }
      })
    }
  })
}
