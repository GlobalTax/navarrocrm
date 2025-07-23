
import { useSharedFormSubmit } from '../shared/useSharedFormSubmit'
import { mapBaseFormDataToEntity } from '@/types/shared/baseFormTypes'
import type { ClientFormData } from '@/components/clients/ClientFormTabs'
import type { Contact } from '@/types/shared/clientTypes'

const mapClientFormDataToEntity = (data: ClientFormData, orgId: string) => ({
  ...mapBaseFormDataToEntity(data, orgId),
  relationship_type: 'cliente' as const,
})

export const useClientFormSubmit = (client: Contact | null, onClose: () => void) => {
  return useSharedFormSubmit({
    entity: client,
    onClose,
    tableName: 'contacts',
    mapFormDataToEntity: mapClientFormDataToEntity,
    successMessage: {
      create: 'Cliente creado exitosamente',
      update: 'Cliente actualizado exitosamente'
    }
  })
}
