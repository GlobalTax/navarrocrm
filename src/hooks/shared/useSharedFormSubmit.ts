
import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { createLogger } from '@/utils/logger'
import type { SubmissionResult, RetryStrategy } from '@/types/shared/formTypes'

interface SharedFormSubmitConfig {
  entity: any | null
  onClose: () => void
  tableName: string
  mapFormDataToEntity: (data: any, orgId: string) => any
  successMessage: {
    create: string
    update: string
  }
  retryStrategy?: RetryStrategy
}

interface FormSubmissionResult {
  success: boolean
  error?: string
}

export const useSharedFormSubmit = ({
  entity,
  onClose,
  tableName,
  mapFormDataToEntity,
  successMessage,
  retryStrategy = { maxRetries: 2, delay: 1000 }
}: SharedFormSubmitConfig) => {
  const logger = createLogger('useSharedFormSubmit')
  const { user } = useApp()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        
        if (attempt < retryStrategy.maxRetries) {
          const delay = retryStrategy.delay * Math.pow(2, attempt)
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

  const submitForm = async (formData: any): Promise<SubmissionResult> => {
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
      if (!formData || typeof formData !== 'object') {
        throw new Error('Los datos del formulario son inválidos')
      }

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
        logger.debug('Actualizando entidad existente', { 
          entityId: entity.id, 
          tableName,
          updateData: Object.keys(entityData)
        })

        result = await executeWithRetry(async () => {
          const { data, error: updateError } = await supabase
            .from(tableName as any)
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
        logger.debug('Creando nueva entidad', { 
          tableName,
          createData: Object.keys(entityData)
        })

        result = await executeWithRetry(async () => {
          const { data, error: createError } = await supabase
            .from(tableName as any)
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
