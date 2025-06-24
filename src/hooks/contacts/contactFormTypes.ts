
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'

export interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  dni_nif: string | null
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_country: string | null
  legal_representative: string | null
  client_type: string | null
  business_sector: string | null
  how_found_us: string | null
  contact_preference: string | null
  preferred_language: string | null
  hourly_rate: number | null
  payment_method: string | null
  status: string | null
  relationship_type: string | null
  tags: string[] | null
  internal_notes: string | null
}

export const defaultContactFormValues: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  dni_nif: '',
  address_street: '',
  address_city: '',
  address_postal_code: '',
  address_country: 'España',
  legal_representative: '',
  client_type: 'particular',
  business_sector: '',
  how_found_us: '',
  contact_preference: 'email',
  preferred_language: 'es',
  hourly_rate: '',
  payment_method: 'transferencia',
  status: 'prospecto',
  relationship_type: 'prospecto',
  tags: [],
  internal_notes: '',
}
