
import { useSharedFormState } from '../shared/useSharedFormState'
import { clientSchema } from './clientFormSchema'
import { defaultClientFormValues, type Client } from './clientFormTypes'
import type { ClientFormData } from '@/components/clients/ClientFormTabs'

const mapClientToFormData = (client: Client): ClientFormData => ({
  name: client.name,
  email: client.email || '',
  phone: client.phone || '',
  dni_nif: client.dni_nif || '',
  address_street: client.address_street || '',
  address_city: client.address_city || '',
  address_postal_code: client.address_postal_code || '',
  address_country: client.address_country || 'España',
  legal_representative: client.legal_representative || '',
  client_type: (client.client_type as ClientFormData['client_type']) || 'particular',
  business_sector: client.business_sector || '',
  how_found_us: client.how_found_us || '',
  contact_preference: (client.contact_preference as ClientFormData['contact_preference']) || 'email',
  preferred_language: (client.preferred_language as ClientFormData['preferred_language']) || 'es',
  hourly_rate: client.hourly_rate?.toString() || '',
  payment_method: (client.payment_method as ClientFormData['payment_method']) || 'transferencia',
  status: (client.status as ClientFormData['status']) || 'prospecto',
  tags: client.tags || [],
  internal_notes: client.internal_notes || '',
})

export const useClientFormState = (client: Client | null) => {
  return useSharedFormState({
    schema: clientSchema,
    defaultValues: defaultClientFormValues,
    entity: client,
    mapEntityToFormData: mapClientToFormData
  })
}
