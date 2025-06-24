
import { useSharedFormSubmit } from '../shared/useSharedFormSubmit'
import { mapBaseFormDataToEntity } from '@/types/shared/baseFormTypes'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'
import type { Contact } from './contactFormTypes'

const mapContactFormDataToEntity = (data: ContactFormData, orgId: string) => ({
  ...mapBaseFormDataToEntity(data, orgId),
  relationship_type: data.relationship_type,
  last_contact_date: new Date().toISOString(),
})

export const useContactFormSubmit = (contact: Contact | null, onClose: () => void) => {
  return useSharedFormSubmit({
    entity: contact,
    onClose,
    tableName: 'contacts',
    mapFormDataToEntity: mapContactFormDataToEntity,
    successMessage: {
      create: 'Contacto creado exitosamente',
      update: 'Contacto actualizado exitosamente'
    }
  })
}
