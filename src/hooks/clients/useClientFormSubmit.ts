
import { useSharedFormSubmit } from '../shared/useSharedFormSubmit'
import { mapBaseFormDataToEntity } from '@/types/shared/baseFormTypes'
import type { ClientFormData } from '@/components/clients/ClientFormTabs'
import type { Client } from './clientFormTypes'

const mapClientFormDataToEntity = (data: ClientFormData, orgId: string) => ({
  ...mapBaseFormDataToEntity(data, orgId),
  relationship_type: 'cliente' as const,
})

export const useClientFormSubmit = (client: Client | null, onClose: () => void) => {
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
