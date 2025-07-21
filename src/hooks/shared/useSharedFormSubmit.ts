import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { createLogger } from '@/utils/logger'
import type { SubmissionResult, RetryStrategy } from '@/types/shared/formTypes'

/**
 * Interfaz para definir la configuración del hook useSharedFormSubmit
 * @template TEntity - Tipo de la entidad (Contact, Client, etc.)
 * @template TFormData - Tipo de los datos del formulario
 */
interface SharedFormSubmitConfig<TEntity extends { id?: string }, TFormData extends Record<string, any>> {
  entity: TEntity | null
  onClose: () => void
  tableName: string
  mapFormDataToEntity: (data: TFormData, orgId: string) => Omit<TEntity, 'id'>
  successMessage: {
    create: string
    update: string
  }
  retryStrategy?: RetryStrategy
}

/**
 * Interfaz para el resultado del envío del formulario
 * @property {boolean} success - Indica si el envío fue exitoso
 * @property {string} [error] - Mensaje de error en caso de fallo
 */
interface FormSubmissionResult {
  success: boolean
  error?: string
}

/**
 * Tipo para definir el estado del envío del formulario
 * @property {boolean} isSubmitting - Indica si el formulario está en proceso de envío
 * @property {string | null} error - Mensaje de error en caso de fallo
 * @property {() => Promise<FormSubmissionResult>} submitForm - Función para enviar el formulario
 */
interface FormSubmitState {
  isSubmitting: boolean
  error: string | null
  submitForm: (data: any) => Promise<FormSubmissionResult>
}

/**
 * Tipo para definir la estrategia de reintentos
 * @property {number} maxRetries - Número máximo de reintentos
 * @property {number} delay - Delay inicial en milisegundos entre reintentos
 */
interface RetryStrategy {
  maxRetries: number
  delay: number
}

/**
 * Tipo para el resultado del envío del formulario
 */
type SubmissionResult = {
  success: boolean
  data?: any
  error?: string
  operation: 'create' | 'update'
  duration: number
}

/**
 * Hook compartido para gestionar el envío de formularios con funcionalidad común
 * Proporciona capacidades robustas de envío, manejo de errores y recuperación
 * 
 * @template TEntity - Tipo de la entidad (Contact, Client, etc.)
 * @template TFormData - Tipo de los datos del formulario
 * 
 * @param {Object} config - Configuración del hook
 * @param {TEntity | null} config.entity - Entidad existente (null para crear nueva)
 * @param {() => void} config.onClose - Función a ejecutar al cerrar el formulario
 * @param {string} config.tableName - Nombre de la tabla en Supabase
 * @param {Function} config.mapFormDataToEntity - Función para mapear datos del formulario a entidad
 * @param {Object} config.successMessage - Mensajes de éxito para crear/actualizar
 * @param {RetryStrategy} [config.retryStrategy] - Estrategia de reintentos para errores de red
 * 
 * @returns {Object} Funciones y estado del envío del formulario
 * 
 * @example
 * ```typescript
 * const { submitForm, isSubmitting, error } = useSharedFormSubmit({
 *   entity: contact,
 *   onClose,
 *   tableName: 'contacts',
 *   mapFormDataToEntity: mapContactFormDataToEntity,
 *   successMessage: {
 *     create: 'Contacto creado exitosamente',
 *     update: 'Contacto actualizado exitosamente'
 *   }
 * })
 * ```
 * 
 * @since 1.0.0
 */
export const useSharedFormSubmit = <TEntity extends { id?: string }, TFormData extends Record<string, any>>({
  entity,
  onClose,
  tableName,
  mapFormDataToEntity,
  successMessage,
  retryStrategy = { maxRetries: 2, delay: 1000 }
}: SharedFormSubmitConfig<TEntity, TFormData>) => {
  const logger = createLogger('useSharedFormSubmit')
  const { user } = useApp()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validación robusta de parámetros
  try {
    if (typeof onClose !== 'function') {
      throw new Error('onClose debe ser una función válida')
    }
    if (!tableName?.trim()) {
      throw new Error('tableName es requerido y no puede estar vacío')
    }
    if (typeof mapFormDataToEntity !== 'function') {
      throw new Error('mapFormDataToEntity debe ser una función válida')
    }
    if (!successMessage?.create || !successMessage?.update) {
      throw new Error('successMessage debe contener mensajes para create y update')
    }
    if (!user?.org_id) {
      throw new Error('Usuario debe tener org_id válido')
    }
  } catch (validationError) {
    logger.error('Error de validación en configuración del hook', { 
      error: validationError, 
      tableName, 
      hasEntity: !!entity,
      hasUser: !!user 
    })
    throw validationError
  }

  /**
   * Estrategia de recuperación para errores de red
   * Implementa reintentos automáticos con backoff exponencial
   */
  const executeWithRetry = async <T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> => {
    let lastError: Error
    
    for (let attempt = 0; attempt <= retryStrategy.maxRetries; attempt++) {
      try {
        logger.debug(`Ejecutando operación: ${context}`, { attempt, maxRetries: retryStrategy.maxRetries })
        const result = await operation()
        
        if (attempt > 0) {
          logger.info(`Operación exitosa tras ${attempt} reintentos`, { context })
        }
        
        return result
      } catch (error) {
        lastError = error as Error
        logger.warn(`Intento ${attempt + 1} fallido para: ${context}`, { 
          error: lastError.message,
          attempt,
          willRetry: attempt < retryStrategy.maxRetries
        })
        
        // Si es el último intento, no esperamos
        if (attempt < retryStrategy.maxRetries) {
          const delay = retryStrategy.delay * Math.pow(2, attempt) // Backoff exponencial
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    logger.error(`Operación falló tras ${retryStrategy.maxRetries + 1} intentos`, { 
      context, 
      finalError: lastError.message 
    })
    throw lastError
  }

  /**
   * Función principal para enviar formularios
   * Maneja tanto creación como actualización de entidades
   */
  const submitForm = async (formData: TFormData): Promise<SubmissionResult> => {
    const startTime = performance.now()
    logger.debug('Iniciando envío de formulario', {
      mode: entity ? 'update' : 'create',
      tableName,
      entityId: entity?.id,
      formDataKeys: Object.keys(formData)
    })

    setIsSubmitting(true)
    setError(null)

    try {
      // Validación de datos del formulario
      if (!formData || typeof formData !== 'object') {
        throw new Error('Los datos del formulario son inválidos')
      }

      // Mapear datos del formulario a entidad
      const entityData = await executeWithRetry(
        () => Promise.resolve(mapFormDataToEntity(formData, user.org_id)),
        'mapFormDataToEntity'
      )

      logger.debug('Datos mapeados exitosamente', {
        originalKeys: Object.keys(formData),
        mappedKeys: Object.keys(entityData),
        orgId: user.org_id
      })

      let result
      
      if (entity?.id) {
        // Actualizar entidad existente
        logger.debug('Actualizando entidad existente', { 
          entityId: entity.id, 
          tableName,
          updateData: Object.keys(entityData)
        })

        result = await executeWithRetry(async () => {
          const { data, error: updateError } = await supabase
            .from(tableName)
            .update(entityData)
            .eq('id', entity.id)
            .eq('org_id', user.org_id)
            .select()

          if (updateError) {
            logger.error('Error en actualización de Supabase', { 
              error: updateError, 
              entityId: entity.id,
              tableName
            })
            throw new Error(`Error al actualizar: ${updateError.message}`)
          }

          if (!data || data.length === 0) {
            throw new Error('No se encontró la entidad para actualizar o no tienes permisos')
          }

          return data[0]
        }, `update-${tableName}`)

        toast.success(successMessage.update)
        logger.info('Entidad actualizada exitosamente', {
          entityId: entity.id,
          tableName,
          duration: performance.now() - startTime
        })
      } else {
        // Crear nueva entidad
        logger.debug('Creando nueva entidad', { 
          tableName,
          createData: Object.keys(entityData)
        })

        result = await executeWithRetry(async () => {
          const { data, error: createError } = await supabase
            .from(tableName)
            .insert(entityData)
            .select()

          if (createError) {
            logger.error('Error en creación de Supabase', { 
              error: createError,
              tableName,
              entityData: Object.keys(entityData)
            })
            throw new Error(`Error al crear: ${createError.message}`)
          }

          if (!data || data.length === 0) {
            throw new Error('No se pudo crear la entidad')
          }

          return data[0]
        }, `create-${tableName}`)

        toast.success(successMessage.create)
        logger.info('Entidad creada exitosamente', {
          newEntityId: result.id,
          tableName,
          duration: performance.now() - startTime
        })
      }

      // Cerrar formulario tras éxito
      onClose()

      return {
        success: true,
        data: result,
        operation: entity?.id ? 'update' : 'create',
        duration: performance.now() - startTime
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const duration = performance.now() - startTime
      
      logger.error('Error en envío de formulario', {
        error: errorMessage,
        mode: entity ? 'update' : 'create',
        tableName,
        duration,
        formDataProvided: !!formData,
        orgId: user.org_id
      })

      setError(errorMessage)
      toast.error('Error al guardar', {
        description: errorMessage
      })

      return {
        success: false,
        error: errorMessage,
        operation: entity?.id ? 'update' : 'create',
        duration
      }
    } finally {
      setIsSubmitting(false)
      logger.debug('Finalizando envío de formulario', {
        duration: performance.now() - startTime,
        tableName
      })
    }
  }

  return {
    submitForm,
    isSubmitting,
    error,
    clearError: () => setError(null)
  }
}
