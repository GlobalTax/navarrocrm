
import { useSharedFormState } from '../shared/useSharedFormState'
import { contactSchema } from './contactFormSchema'
import { defaultContactFormValues } from './contactFormTypes'
import { mapBaseEntityToFormData } from '@/types/shared/baseFormTypes'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'
import type { Contact } from '@/hooks/useContacts'

const mapContactToFormData = (contact: Contact): ContactFormData => ({
  ...mapBaseEntityToFormData(contact),
  relationship_type: (contact.relationship_type as ContactFormData['relationship_type']) || 'prospecto',
} as ContactFormData)

export const useContactFormState = (contact: Contact | null) => {
  return useSharedFormState({
    schema: contactSchema,
    defaultValues: defaultContactFormValues,
    entity: contact,
    mapEntityToFormData: mapContactToFormData
  })
}
