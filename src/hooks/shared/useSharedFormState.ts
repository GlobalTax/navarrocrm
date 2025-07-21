
import { useEffect, useState, useCallback } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createLogger } from '@/utils/logger'
import { createError } from '@/utils/errorHandler'
import type { CompanyData } from '@/hooks/useCompanyLookup'

/**
 * Configuración para el hook de estado compartido de formularios
 * @template T - Tipo de datos del formulario
 * @template D - Tipo de entidad de datos
 */
export interface SharedFormStateConfig<T extends Record<string, any>, D> {
  /** Schema de validación Zod para el formulario */
  schema: any
  /** Valores por defecto del formulario */
  defaultValues: T
  /** Entidad existente para edición (null para crear nuevo) */
  entity: D | null
  /** Función para mapear entidad a datos de formulario */
  mapEntityToFormData: (entity: D) => T
}

/**
 * Resultado del hook de estado compartido de formularios
 * @template T - Tipo de datos del formulario
 */
export interface SharedFormStateResult<T extends Record<string, any>> {
  /** Instancia del formulario de react-hook-form */
  form: UseFormReturn<T>
  /** Indica si estamos en modo edición */
  isEditing: boolean
  /** Indica si los datos de empresa han sido cargados */
  isCompanyDataLoaded: boolean
  /** Función para manejar datos de empresa encontrados */
  handleCompanyFound: (companyData: CompanyData) => void
}

/**
 * Hook compartido para gestionar el estado de formularios con validación unificada
 * 
 * Proporciona funcionalidad común para formularios de entidades como contactos, clientes, etc.
 * Incluye soporte para autocompletado de datos empresariales y gestión de estado unificada.
 * 
 * @template T - Tipo de datos del formulario que extiende Record<string, any>
 * @template D - Tipo de entidad de datos original
 * 
 * @param {SharedFormStateConfig<T, D>} config - Configuración del formulario
 * @param {any} config.schema - Schema de validación Zod
 * @param {T} config.defaultValues - Valores por defecto del formulario
 * @param {D | null} config.entity - Entidad existente para edición
 * @param {(entity: D) => T} config.mapEntityToFormData - Función de mapeo entidad → formulario
 * 
 * @returns {SharedFormStateResult<T>} Objeto con estado y funciones del formulario
 * 
 * @example
 * ```typescript
 * const { form, isEditing, handleCompanyFound } = useSharedFormState({
 *   schema: clientSchema,
 *   defaultValues: defaultClientFormValues,
 *   entity: selectedClient,
 *   mapEntityToFormData: (client) => ({ 
 *     name: client.name,
 *     email: client.email || ''
 *   })
 * })
 * 
 * // Usar en componente
 * <Form {...form}>
 *   <FormField name="name" render={...} />
 * </Form>
 * ```
 * 
 * @since 1.0.0
 * @category Form Management
 */
export const useSharedFormState = <T extends Record<string, any>, D>({
  schema,
  defaultValues,
  entity,
  mapEntityToFormData
}: SharedFormStateConfig<T, D>): SharedFormStateResult<T> => {
  const logger = createLogger('useSharedFormState')
  const startTime = Date.now()
  
  // Validación de parámetros críticos
  if (!schema) {
    const error = createError('Schema de validación es requerido', {
      severity: 'high',
      userMessage: 'Error en configuración del formulario',
      technicalMessage: 'Missing validation schema in useSharedFormState'
    })
    logger.error('Schema validation missing', { error: error.message })
    throw error
  }

  if (!defaultValues || typeof defaultValues !== 'object') {
    const error = createError('Valores por defecto son requeridos', {
      severity: 'high',
      userMessage: 'Error en configuración del formulario',
      technicalMessage: 'Invalid defaultValues in useSharedFormState'
    })
    logger.error('Default values validation failed', { 
      defaultValues: typeof defaultValues,
      isObject: typeof defaultValues === 'object'
    })
    throw error
  }

  if (!mapEntityToFormData || typeof mapEntityToFormData !== 'function') {
    const error = createError('Función de mapeo es requerida', {
      severity: 'high',
      userMessage: 'Error en configuración del formulario',
      technicalMessage: 'Invalid mapEntityToFormData function in useSharedFormState'
    })
    logger.error('Mapping function validation failed', { 
      mapEntityToFormData: typeof mapEntityToFormData
    })
    throw error
  }

  const isEditing = !!entity
  const [isCompanyDataLoaded, setIsCompanyDataLoaded] = useState(false)

  // Inicialización del formulario con métricas de rendimiento
  const form: UseFormReturn<T> = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  })

  logger.info('Form state initialized', {
    isEditing,
    hasEntity: !!entity,
    entityId: (entity as any)?.id,
    defaultValuesKeys: Object.keys(defaultValues),
    initTime: Date.now() - startTime
  })

  /**
   * Effect para resetear el formulario cuando cambia la entidad
   * Incluye logging detallado para debugging
   */
  useEffect(() => {
    const effectStartTime = Date.now()
    
    try {
      logger.info('Form reset triggered', {
        hasEntity: !!entity,
        entityId: (entity as any)?.id,
        entityName: (entity as any)?.name,
        entityClientType: (entity as any)?.client_type,
        entityCompanyId: (entity as any)?.company_id
      })

      if (entity) {
        // Mapeo de entidad a datos de formulario con validación
        const formData = mapEntityToFormData(entity)
        
        if (!formData || typeof formData !== 'object') {
          throw createError('Datos de formulario inválidos después del mapeo', {
            severity: 'medium',
            userMessage: 'Error al cargar datos del formulario',
            technicalMessage: 'mapEntityToFormData returned invalid data'
          })
        }

        logger.debug('Entity mapped to form data', {
          entityId: (entity as any)?.id,
          formDataKeys: Object.keys(formData),
          mappedValues: {
            name: formData.name,
            client_type: formData.client_type,
            company_id: (formData as any).company_id
          },
          mappingTime: Date.now() - effectStartTime
        })

        form.reset(formData as any)
        setIsCompanyDataLoaded((entity as any).client_type === 'empresa')
        
        // Verificación post-reset con timeout para debugging
        setTimeout(() => {
          const currentValues = form.getValues()
          logger.debug('Form values after reset verification', {
            client_type: currentValues.client_type,
            company_id: (currentValues as any).company_id,
            name: currentValues.name,
            verificationTime: Date.now() - effectStartTime
          })
        }, 100)
      } else {
        logger.debug('Resetting to default values', { 
          defaultValues,
          resetTime: Date.now() - effectStartTime
        })
        form.reset(defaultValues as any)
        setIsCompanyDataLoaded(false)
      }

      logger.info('Form reset completed', {
        totalTime: Date.now() - effectStartTime,
        hasEntity: !!entity,
        isCompanyLoaded: isCompanyDataLoaded
      })
    } catch (error) {
      logger.error('Form reset failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        entityId: (entity as any)?.id,
        resetTime: Date.now() - effectStartTime
      })
      
      // Fallback a valores por defecto en caso de error
      form.reset(defaultValues as any)
      setIsCompanyDataLoaded(false)
    }
  }, [entity, form, defaultValues, mapEntityToFormData, logger])

  /**
   * Maneja los datos encontrados de una empresa mediante búsqueda
   * Actualiza el formulario con información oficial del Registro Mercantil
   * 
   * @param {CompanyData} companyData - Datos de la empresa encontrada
   */
  const handleCompanyFound = useCallback((companyData: CompanyData) => {
    const operationStartTime = Date.now()
    
    try {
      // Validación de datos de empresa
      if (!companyData || typeof companyData !== 'object') {
        throw createError('Datos de empresa inválidos', {
          severity: 'medium',
          userMessage: 'Error en los datos de empresa recibidos',
          technicalMessage: 'Invalid companyData received in handleCompanyFound'
        })
      }

      if (!companyData.name || !companyData.nif) {
        throw createError('Datos de empresa incompletos', {
          severity: 'medium',
          userMessage: 'La empresa encontrada no tiene datos suficientes',
          technicalMessage: 'Missing required fields (name, nif) in companyData'
        })
      }

      logger.info('Company data received', {
        companyName: companyData.name,
        nif: companyData.nif,
        status: companyData.status,
        hasAddress: !!(companyData.address_street && companyData.address_city),
        dataFields: Object.keys(companyData)
      })
      
      const currentValues = form.getValues()
      const updatedValues: T = {
        ...currentValues,
        name: companyData.name,
        dni_nif: companyData.nif,
        client_type: 'empresa',
        status: companyData.status,
        address_street: companyData.address_street || currentValues.address_street,
        address_city: companyData.address_city || currentValues.address_city,
        address_postal_code: companyData.address_postal_code || currentValues.address_postal_code,
        business_sector: companyData.business_sector || currentValues.business_sector,
        legal_representative: companyData.legal_representative || currentValues.legal_representative,
      } as T

      // Manejo especial para contactos con relationship_type
      if ('relationship_type' in currentValues) {
        (updatedValues as any).relationship_type = companyData.status === 'activo' ? 'cliente' : 'prospecto'
      }

      form.reset(updatedValues as any)
      setIsCompanyDataLoaded(true)

      logger.info('Company data applied to form', {
        companyName: companyData.name,
        fieldsUpdated: Object.keys(updatedValues).length,
        relationshipType: (updatedValues as any).relationship_type,
        operationTime: Date.now() - operationStartTime
      })

      toast.success('Formulario completado con datos oficiales del Registro Mercantil')
    } catch (error) {
      logger.error('Company data application failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        companyData: companyData?.name || 'Unknown company',
        operationTime: Date.now() - operationStartTime
      })

      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Error al aplicar datos de empresa')
      }
    }
  }, [form, logger])

  // Log de métricas finales
  logger.debug('Hook execution completed', {
    totalTime: Date.now() - startTime,
    isEditing,
    isCompanyDataLoaded,
    formState: {
      isDirty: form.formState.isDirty,
      isValid: form.formState.isValid,
      errors: Object.keys(form.formState.errors)
    }
  })

  return {
    form,
    isEditing,
    isCompanyDataLoaded,
    handleCompanyFound
  }
}
