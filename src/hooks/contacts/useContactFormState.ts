
import { useSharedFormState } from '../shared/useSharedFormState'
import { contactSchema } from './contactFormSchema'
import { defaultContactFormValues, type Contact } from './contactFormTypes'
import { mapBaseEntityToFormData } from '@/types/shared/baseFormTypes'
import { useLogger } from '../useLogger'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'

const mapContactToFormData = (contact: Contact): ContactFormData => {
  const logger = useLogger('mapContactToFormData')
  
  const formData = {
    ...mapBaseEntityToFormData(contact),
    relationship_type: (contact.relationship_type as ContactFormData['relationship_type']) || 'prospecto',
    company_id: contact.company_id || '',
  } as ContactFormData
  
  logger.info('Contact mapping', {
    contactId: contact.id,
    contactName: contact.name,
    clientType: contact.client_type,
    originalCompanyId: contact.company_id,
    mappedCompanyId: formData.company_id,
    relationshipType: formData.relationship_type,
    shouldShowSelector: contact.client_type !== 'empresa',
    fullFormData: {
      name: formData.name,
      client_type: formData.client_type,
      company_id: formData.company_id,
      relationship_type: formData.relationship_type
    }
  })
  
  return formData
}

export const useContactFormState = (contact: Contact | null) => {
  return useSharedFormState({
    schema: contactSchema,
    defaultValues: defaultContactFormValues,
    entity: contact,
    mapEntityToFormData: mapContactToFormData
  })
}
