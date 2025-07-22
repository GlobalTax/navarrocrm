
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

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

        if (error) throw error
        toast.success(successMessage.update)
      } else {
        const { error } = await supabase
          .from(tableName as any)
          .insert(entityData)

        if (error) throw error
        toast.success(successMessage.create)
      }

      onClose()
    } catch (error) {
      console.error(`Error saving ${tableName}:`, error)
      toast.error(`Error al guardar`)
    }
  }

  return { onSubmit }
}
