
import { useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { createLogger } from '@/utils/logger'
import { createError, handleError } from '@/utils/errorHandler'

/**
 * Entidad con ID requerido para operaciones de actualización
 */
export interface EntityWithId {
  /** Identificador único de la entidad */
  id: string
}

/**
 * Configuración para el hook de envío compartido de formularios
 * @template T - Tipo de datos del formulario
 */
export interface SharedFormSubmitConfig<T> {
  /** Entidad existente para edición (null para crear nueva) */
  entity: EntityWithId | null
  /** Función a ejecutar al cerrar el formulario */
  onClose: () => void
  /** Nombre de la tabla en Supabase */
  tableName: string
  /** Función para mapear datos del formulario a entidad de base de datos */
  mapFormDataToEntity: (data: T, orgId: string) => Record<string, any>
  /** Mensajes de éxito personalizados */
  successMessage: {
    /** Mensaje para operación de creación */
    create: string
    /** Mensaje para operación de actualización */
    update: string
  }
}

/**
 * Resultado del hook de envío compartido de formularios
 * @template T - Tipo de datos del formulario
 */
export interface SharedFormSubmitResult<T> {
  /** Función para enviar el formulario */
  onSubmit: (data: T) => Promise<void>
}

/**
 * Estrategias de recuperación para diferentes tipos de errores
 */
interface RecoveryStrategy {
  /** Nombre de la estrategia */
  name: string
  /** Función de recuperación que retorna true si fue exitosa */
  execute: () => Promise<boolean>
  /** Número máximo de intentos */
  maxAttempts: number
}

/**
 * Hook compartido para gestionar el envío de formularios con validación y recuperación
 * 
 * Proporciona funcionalidad unificada para operaciones CRUD en formularios de entidades.
 * Incluye manejo robusto de errores, logging detallado, validación de autenticación
 * y estrategias de recuperación para errores de red.
 * 
 * @template T - Tipo de datos del formulario
 * 
 * @param {SharedFormSubmitConfig<T>} config - Configuración del envío
 * @param {EntityWithId | null} config.entity - Entidad existente para edición
 * @param {() => void} config.onClose - Función de cierre del formulario
 * @param {string} config.tableName - Nombre de la tabla en Supabase
 * @param {(data: T, orgId: string) => Record<string, any>} config.mapFormDataToEntity - Función de mapeo
 * @param {object} config.successMessage - Mensajes de éxito personalizados
 * 
 * @returns {SharedFormSubmitResult<T>} Objeto con función de envío
 * 
 * @example
 * ```typescript
 * const { onSubmit } = useSharedFormSubmit({
 *   entity: selectedClient,
 *   onClose: () => setDialogOpen(false),
 *   tableName: 'contacts',
 *   mapFormDataToEntity: (data, orgId) => ({
 *     ...data,
 *     org_id: orgId,
 *     updated_at: new Date().toISOString()
 *   }),
 *   successMessage: {
 *     create: 'Cliente creado exitosamente',
 *     update: 'Cliente actualizado exitosamente'
 *   }
 * })
 * 
 * // Usar en formulario
 * <form onSubmit={form.handleSubmit(onSubmit)}>
 *   {/* campos del formulario */}
 * </form>
 * ```
 * 
 * @throws {AppError} Cuando faltan parámetros requeridos o hay errores de validación
 * 
 * @since 1.0.0
 * @category Form Management
 */
export const useSharedFormSubmit = <T>({
  entity,
  onClose,
  tableName,
  mapFormDataToEntity,
  successMessage
}: SharedFormSubmitConfig<T>): SharedFormSubmitResult<T> => {
  const { user } = useApp()
  const isEditing = !!entity
  const logger = createLogger(`SharedFormSubmit-${tableName}`)

  // Validación exhaustiva de parámetros en la inicialización
  if (typeof onClose !== 'function') {
    const error = createError('onClose debe ser una función válida', {
      severity: 'high',
      userMessage: 'Error en configuración del formulario',
      technicalMessage: 'Invalid onClose function in useSharedFormSubmit'
    })
    logger.error('Parameter validation failed', { onClose: typeof onClose })
    throw error
  }

  if (!tableName || typeof tableName !== 'string' || tableName.trim().length === 0) {
    const error = createError('Nombre de tabla es requerido', {
      severity: 'high',
      userMessage: 'Error en configuración del formulario',
      technicalMessage: 'Invalid tableName in useSharedFormSubmit'
    })
    logger.error('Table name validation failed', { tableName })
    throw error
  }

  if (!mapFormDataToEntity || typeof mapFormDataToEntity !== 'function') {
    const error = createError('Función de mapeo es requerida', {
      severity: 'high',
      userMessage: 'Error en configuración del formulario',
      technicalMessage: 'Invalid mapFormDataToEntity function in useSharedFormSubmit'
    })
    logger.error('Mapping function validation failed', { 
      mapFormDataToEntity: typeof mapFormDataToEntity 
    })
    throw error
  }

  if (!successMessage || !successMessage.create || !successMessage.update) {
    const error = createError('Mensajes de éxito son requeridos', {
      severity: 'medium',
      userMessage: 'Error en configuración del formulario',
      technicalMessage: 'Invalid successMessage configuration in useSharedFormSubmit'
    })
    logger.error('Success message validation failed', { successMessage })
    throw error
  }

  logger.info('Form submit hook initialized', {
    tableName,
    isEditing,
    entityId: entity?.id,
    hasSuccessMessages: !!(successMessage.create && successMessage.update)
  })

  /**
   * Estrategias de recuperación para errores de red
   */
  const getRecoveryStrategies = useCallback((): RecoveryStrategy[] => [
    {
      name: 'network_retry',
      maxAttempts: 3,
      execute: async () => {
        logger.info('Attempting network recovery', { strategy: 'network_retry' })
        // Verificar conectividad básica
        try {
          const response = await fetch('/api/health', { method: 'HEAD' })
          return response.ok
        } catch {
          return false
        }
      }
    },
    {
      name: 'supabase_reconnect',
      maxAttempts: 2,
      execute: async () => {
        logger.info('Attempting Supabase reconnection', { strategy: 'supabase_reconnect' })
        try {
          // Intentar operación simple para verificar conectividad
          const { error } = await supabase.from('organizations').select('id').limit(1)
          return !error
        } catch {
          return false
        }
      }
    }
  ], [logger])

  /**
   * Ejecuta estrategias de recuperación para errores de red
   * @param {Error} error - Error original que necesita recuperación
   * @returns {Promise<boolean>} True si la recuperación fue exitosa
   */
  const attemptRecovery = useCallback(async (error: Error): Promise<boolean> => {
    const strategies = getRecoveryStrategies()
    
    for (const strategy of strategies) {
      logger.info('Executing recovery strategy', {
        strategy: strategy.name,
        maxAttempts: strategy.maxAttempts,
        originalError: error.message
      })

      for (let attempt = 1; attempt <= strategy.maxAttempts; attempt++) {
        try {
          const success = await strategy.execute()
          if (success) {
            logger.info('Recovery strategy succeeded', {
              strategy: strategy.name,
              attempt,
              totalAttempts: strategy.maxAttempts
            })
            return true
          }
          logger.warn('Recovery strategy attempt failed', {
            strategy: strategy.name,
            attempt,
            remainingAttempts: strategy.maxAttempts - attempt
          })
        } catch (recoveryError) {
          logger.error('Recovery strategy execution failed', {
            strategy: strategy.name,
            attempt,
            error: recoveryError instanceof Error ? recoveryError.message : 'Unknown error'
          })
        }

        // Delay exponencial entre intentos
        if (attempt < strategy.maxAttempts) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    logger.error('All recovery strategies failed', {
      strategiesAttempted: strategies.length,
      originalError: error.message
    })
    return false
  }, [getRecoveryStrategies, logger])

  /**
   * Función principal de envío del formulario
   * Maneja todo el ciclo de vida de la operación con logging detallado
   */
  const onSubmit = useCallback(async (data: T): Promise<void> => {
    const operationId = crypto.randomUUID()
    const operationStartTime = Date.now()
    
    logger.info('Form submission started', {
      operationId,
      tableName,
      isEditing,
      entityId: entity?.id,
      userId: user?.id,
      orgId: user?.org_id,
      dataKeys: data ? Object.keys(data as Record<string, any>) : []
    })

    // Validación de autenticación crítica
    if (!user?.org_id) {
      const authError = createError('Usuario no autenticado o sin organización', {
        severity: 'high',
        userMessage: 'Error: No se pudo identificar la organización',
        technicalMessage: 'Missing user.org_id in form submission',
        showToast: true
      })
      
      logger.error('Authentication validation failed', {
        operationId,
        hasUser: !!user,
        userId: user?.id,
        hasOrgId: !!user?.org_id,
        validationTime: Date.now() - operationStartTime
      })
      
      handleError(authError, `SharedFormSubmit-${tableName}`)
      return
    }

    // Validación de datos del formulario
    if (!data || typeof data !== 'object') {
      const dataError = createError('Datos del formulario inválidos', {
        severity: 'high',
        userMessage: 'Error en los datos del formulario',
        technicalMessage: 'Invalid form data in submission'
      })
      
      logger.error('Form data validation failed', {
        operationId,
        dataType: typeof data,
        isObject: typeof data === 'object',
        hasData: !!data
      })
      
      handleError(dataError, `SharedFormSubmit-${tableName}`)
      return
    }

    try {
      // Fase 1: Mapeo de datos con métricas de rendimiento
      const mappingStartTime = Date.now()
      logger.info('Starting data mapping', { operationId, tableName })
      
      const entityData = mapFormDataToEntity(data, user.org_id)
      
      if (!entityData || typeof entityData !== 'object') {
        throw createError('Datos mapeados inválidos', {
          severity: 'high',
          userMessage: 'Error al procesar los datos del formulario',
          technicalMessage: 'mapFormDataToEntity returned invalid data'
        })
      }
      
      const mappingTime = Date.now() - mappingStartTime
      logger.debug('Data mapping completed', {
        operationId,
        mappedKeys: Object.keys(entityData),
        dataSize: JSON.stringify(entityData).length,
        mappingTime
      })

      // Fase 2: Operación de base de datos con retry logic
      const dbStartTime = Date.now()
      logger.info(`Executing database operation: ${isEditing ? 'UPDATE' : 'INSERT'}`, {
        operationId,
        tableName,
        entityId: entity?.id,
        recordSize: Object.keys(entityData).length
      })

      let dbOperation: Promise<any>

      if (isEditing && entity) {
        dbOperation = supabase
          .from(tableName as any)
          .update(entityData)
          .eq('id', entity.id)
      } else {
        dbOperation = supabase
          .from(tableName as any)
          .insert(entityData)
      }

      const { error: dbError } = await dbOperation
      const dbTime = Date.now() - dbStartTime

      if (dbError) {
        // Intentar recuperación automática para errores de red
        if (dbError.message.includes('network') || dbError.message.includes('timeout')) {
          logger.warn('Network error detected, attempting recovery', {
            operationId,
            error: dbError.message,
            dbTime
          })

          const recoverySuccess = await attemptRecovery(new Error(dbError.message))
          if (recoverySuccess) {
            // Reintentar operación después de recuperación exitosa
            const { error: retryError } = await dbOperation
            if (!retryError) {
              logger.info('Operation successful after recovery', {
                operationId,
                retryTime: Date.now() - dbStartTime
              })
              toast.success(isEditing ? successMessage.update : successMessage.create)
              onClose()
              return
            }
          }
        }

        throw createError(`Error en operación de base de datos: ${tableName}`, {
          severity: 'high',
          userMessage: isEditing ? 'Error al actualizar el registro' : 'Error al crear el registro',
          technicalMessage: dbError.message,
          showToast: true
        })
      }

      logger.info('Database operation completed successfully', {
        operationId,
        operation: isEditing ? 'update' : 'create',
        tableName,
        entityId: entity?.id,
        dbTime,
        totalTime: Date.now() - operationStartTime
      })
      
      toast.success(isEditing ? successMessage.update : successMessage.create)
      onClose()

    } catch (error) {
      const totalTime = Date.now() - operationStartTime
      
      logger.error('Form submission failed', {
        operationId,
        tableName,
        operation: isEditing ? 'update' : 'create',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        totalTime,
        entityId: entity?.id
      })

      // Manejo especializado de errores de base de datos
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          handleError(createError('Registro duplicado', {
            severity: 'medium',
            userMessage: 'Ya existe un registro con estos datos',
            technicalMessage: error.message
          }), `SharedFormSubmit-${tableName}`)
        } else if (error.message.includes('violates foreign key')) {
          handleError(createError('Error de referencia', {
            severity: 'medium',
            userMessage: 'Error en las relaciones de datos',
            technicalMessage: error.message
          }), `SharedFormSubmit-${tableName}`)
        } else if (error.message.includes('permission denied')) {
          handleError(createError('Permisos insuficientes', {
            severity: 'high',
            userMessage: 'No tienes permisos para realizar esta operación',
            technicalMessage: error.message
          }), `SharedFormSubmit-${tableName}`)
        } else {
          handleError(error, `SharedFormSubmit-${tableName}`)
        }
      } else {
        handleError(createError('Error desconocido en envío de formulario', {
          severity: 'high',
          userMessage: 'Ha ocurrido un error inesperado',
          technicalMessage: 'Unknown error type in form submission'
        }), `SharedFormSubmit-${tableName}`)
      }
    }
  }, [
    entity,
    user,
    tableName,
    isEditing,
    mapFormDataToEntity,
    successMessage,
    onClose,
    attemptRecovery,
    logger
  ])

  logger.debug('Form submit hook ready', {
    tableName,
    isEditing,
    hasEntity: !!entity,
    hasUser: !!user,
    hasOrgId: !!user?.org_id
  })

  return { onSubmit }
}
