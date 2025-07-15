
import { useSharedFormState } from '../shared/useSharedFormState'
import { contactSchema } from './contactFormSchema'
import { defaultContactFormValues, type Contact } from './contactFormTypes'
import { mapBaseEntityToFormData } from '@/types/shared/baseFormTypes'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'

const mapContactToFormData = (contact: Contact): ContactFormData => {
  const formData = {
    ...mapBaseEntityToFormData(contact),
    relationship_type: (contact.relationship_type as ContactFormData['relationship_type']) || 'prospecto',
    company_id: contact.company_id || '',
  } as ContactFormData
  
  console.log('🔄 mapContactToFormData:', {
    contactId: contact.id,
    contactName: contact.name,
    clientType: contact.client_type,
    companyId: contact.company_id,
    mappedCompanyId: formData.company_id,
    relationshipType: formData.relationship_type
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
