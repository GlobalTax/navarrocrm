
import { useSharedFormSubmit } from '../shared/useSharedFormSubmit'
import type { ClientFormData } from '@/components/clients/ClientFormTabs'
import type { Client } from './clientFormTypes'

const mapClientFormDataToEntity = (data: ClientFormData, orgId: string) => ({
  name: data.name,
  email: data.email || null,
  phone: data.phone || null,
  dni_nif: data.dni_nif || null,
  address_street: data.address_street || null,
  address_city: data.address_city || null,
  address_postal_code: data.address_postal_code || null,
  address_country: data.address_country || null,
  legal_representative: data.legal_representative || null,
  client_type: data.client_type,
  business_sector: data.business_sector || null,
  how_found_us: data.how_found_us || null,
  contact_preference: data.contact_preference,
  preferred_language: data.preferred_language,
  hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
  payment_method: data.payment_method,
  status: data.status,
  tags: data.tags || null,
  internal_notes: data.internal_notes || null,
  org_id: orgId,
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
