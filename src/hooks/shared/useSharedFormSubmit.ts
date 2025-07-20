
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { createLogger } from '@/utils/logger'
import { createError, handleError } from '@/utils/errorHandler'

interface EntityWithId {
  id: string
}

interface SharedFormSubmitConfig<T> {
  entity: EntityWithId | null
  onClose: () => void
  tableName: string
  mapFormDataToEntity: (data: T, orgId: string) => Record<string, any>
  successMessage: {
    create: string
    update: string
  }
}

export const useSharedFormSubmit = <T>({
  entity,
  onClose,
  tableName,
  mapFormDataToEntity,
  successMessage
}: SharedFormSubmitConfig<T>) => {
  const { user } = useApp()
  const isEditing = !!entity
  const logger = createLogger(`SharedFormSubmit-${tableName}`)

  const onSubmit = async (data: T) => {
    const operationId = crypto.randomUUID()
    
    logger.info('🚀 Iniciando operación de formulario', {
      operationId,
      tableName,
      isEditing,
      entityId: entity?.id,
      userId: user?.id,
      orgId: user?.org_id
    })

    // Validación de autenticación
    if (!user?.org_id) {
      const authError = createError('Usuario no autenticado o sin organización', {
        severity: 'high',
        userMessage: 'Error: No se pudo identificar la organización',
        technicalMessage: 'Missing user.org_id in form submission',
        showToast: true
      })
      
      logger.error('❌ Error de autenticación', {
        operationId,
        error: 'Missing org_id',
        userId: user?.id
      })
      
      handleError(authError, `SharedFormSubmit-${tableName}`)
      return
    }

    try {
      // Fase 1: Mapeo de datos
      logger.info('📝 Mapeando datos del formulario', { operationId })
      const entityData = mapFormDataToEntity(data, user.org_id)
      
      logger.debug('✅ Datos mapeados correctamente', {
        operationId,
        dataKeys: Object.keys(entityData),
        dataSize: JSON.stringify(entityData).length
      })

      // Fase 2: Operación de base de datos
      logger.info(`💾 Ejecutando operación ${isEditing ? 'UPDATE' : 'INSERT'}`, {
        operationId,
        entityId: entity?.id
      })

      if (isEditing && entity) {
        const { error } = await supabase
          .from(tableName as any)
          .update(entityData)
          .eq('id', entity.id)

        if (error) {
          throw createError(`Error al actualizar ${tableName}`, {
            severity: 'high',
            userMessage: `Error al actualizar el registro`,
            technicalMessage: error.message,
            showToast: true
          })
        }

        logger.info('✅ Actualización exitosa', {
          operationId,
          entityId: entity.id,
          tableName
        })
        
        toast.success(successMessage.update)
      } else {
        const { error } = await supabase
          .from(tableName as any)
          .insert(entityData)

        if (error) {
          throw createError(`Error al crear ${tableName}`, {
            severity: 'high',
            userMessage: `Error al crear el registro`,
            technicalMessage: error.message,
            showToast: true
          })
        }

        logger.info('✅ Creación exitosa', {
          operationId,
          tableName
        })
        
        toast.success(successMessage.create)
      }

      logger.info('🎉 Operación completada exitosamente', {
        operationId,
        operation: isEditing ? 'update' : 'create',
        tableName
      })

      onClose()
    } catch (error) {
      logger.error('💥 Error en operación de formulario', {
        operationId,
        tableName,
        operation: isEditing ? 'update' : 'create',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })

      if (error instanceof Error && error.message.includes('duplicate key')) {
        handleError(createError('Registro duplicado', {
          severity: 'medium',
          userMessage: 'Ya existe un registro con estos datos',
          technicalMessage: error.message
        }), `SharedFormSubmit-${tableName}`)
      } else if (error instanceof Error && error.message.includes('violates foreign key')) {
        handleError(createError('Error de referencia', {
          severity: 'medium',
          userMessage: 'Error en las relaciones de datos',
          technicalMessage: error.message
        }), `SharedFormSubmit-${tableName}`)
      } else {
        handleError(error, `SharedFormSubmit-${tableName}`)
      }
    }
  }

  return { onSubmit }
}
