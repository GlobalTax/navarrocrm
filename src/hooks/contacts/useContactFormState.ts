
import { useSharedFormState } from '../shared/useSharedFormState'
import { contactSchema } from './contactFormSchema'
import { defaultContactFormValues, type Contact } from './contactFormTypes'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'

const mapContactToFormData = (contact: Contact): ContactFormData => ({
  name: contact.name,
  email: contact.email || '',
  phone: contact.phone || '',
  dni_nif: contact.dni_nif || '',
  address_street: contact.address_street || '',
  address_city: contact.address_city || '',
  address_postal_code: contact.address_postal_code || '',
  address_country: contact.address_country || 'España',
  legal_representative: contact.legal_representative || '',
  client_type: (contact.client_type as ContactFormData['client_type']) || 'particular',
  business_sector: contact.business_sector || '',
  how_found_us: contact.how_found_us || '',
  contact_preference: (contact.contact_preference as ContactFormData['contact_preference']) || 'email',
  preferred_language: (contact.preferred_language as ContactFormData['preferred_language']) || 'es',
  hourly_rate: contact.hourly_rate?.toString() || '',
  payment_method: (contact.payment_method as ContactFormData['payment_method']) || 'transferencia',
  status: (contact.status as ContactFormData['status']) || 'prospecto',
  relationship_type: (contact.relationship_type as ContactFormData['relationship_type']) || 'prospecto',
  tags: contact.tags || [],
  internal_notes: contact.internal_notes || '',
})

export const useContactFormState = (contact: Contact | null) => {
  return useSharedFormState({
    schema: contactSchema,
    defaultValues: defaultContactFormValues,
    entity: contact,
    mapEntityToFormData: mapContactToFormData
  })
}
