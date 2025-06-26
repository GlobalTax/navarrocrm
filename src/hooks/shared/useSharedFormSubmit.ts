
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

interface SharedFormSubmitConfig<T, D> {
  entity: D | null
  onClose: () => void
  tableName: string
  mapFormDataToEntity: (data: T, orgId: string) => Record<string, any>
  successMessage: {
    create: string
    update: string
  }
}

export const useSharedFormSubmit = <T, D extends { id: string }>({
  entity,
  onClose,
  tableName,
  mapFormDataToEntity,
  successMessage
}: SharedFormSubmitConfig<T, D>) => {
  const { user } = useApp()
  const isEditing = !!entity

  // Función helper para traducir errores de Supabase
  const getErrorMessage = (error: any, action: 'create' | 'update') => {
    if (error.code === '23505') {
      return 'Ya existe un registro con estos datos'
    } else if (error.code === '23503') {
      return 'No se puede eliminar este registro porque está siendo utilizado'
    } else if (error.code === '42P01') {
      return 'Error de configuración de la base de datos'
    } else if (error.message?.includes('duplicate key')) {
      return 'Ya existe un registro con estos datos'
    } else {
      return `Error al ${action === 'create' ? 'crear' : 'actualizar'} el ${tableName === 'contacts' ? 'contacto' : 'cliente'}`
    }
  }

  const onSubmit = async (data: T) => {
    if (!user?.org_id) {
      toast.error('Error: No se pudo identificar la organización')
      return
    }

    try {
      const entityData = mapFormDataToEntity(data, user.org_id)

      if (isEditing && entity) {
        const { error } = await supabase
          .from(tableName as any)
          .update(entityData)
          .eq('id', entity.id)

        if (error) {
          console.error(`Error updating ${tableName}:`, error)
          throw new Error(getErrorMessage(error, 'update'))
        }
        toast.success(successMessage.update)
      } else {
        const { error } = await supabase
          .from(tableName as any)
          .insert(entityData)

        if (error) {
          console.error(`Error creating ${tableName}:`, error)
          throw new Error(getErrorMessage(error, 'create'))
        }
        toast.success(successMessage.create)
      }

      onClose()
    } catch (error) {
      console.error(`Error saving ${tableName}:`, error)
      const errorMessage = error instanceof Error ? error.message : `Error al guardar el ${tableName === 'contacts' ? 'contacto' : 'cliente'}`
      toast.error(errorMessage)
    }
  }

  return { onSubmit }
}
