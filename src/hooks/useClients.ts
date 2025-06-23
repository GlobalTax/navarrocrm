
import { useContacts } from './useContacts'

// Backward compatibility hook for existing components
export const useClients = () => {
  const { 
    contacts, 
    filteredContacts,
    isLoading, 
    error, 
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    relationshipFilter,
    setRelationshipFilter
  } = useContacts()
  
  // Map contacts to client format for backward compatibility
  const clients = contacts.map(contact => ({
    ...contact,
    // Ensure all expected properties are present
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    dni_nif: contact.dni_nif,
    address_street: contact.address_street,
    address_city: contact.address_city,
    address_postal_code: contact.address_postal_code,
    address_country: contact.address_country,
    legal_representative: contact.legal_representative,
    client_type: contact.client_type,
    business_sector: contact.business_sector,
    how_found_us: contact.how_found_us,
    contact_preference: contact.contact_preference,
    preferred_language: contact.preferred_language,
    hourly_rate: contact.hourly_rate,
    payment_method: contact.payment_method,
    status: contact.status,
    relationship_type: contact.relationship_type,
    tags: contact.tags,
    internal_notes: contact.internal_notes,
    last_contact_date: contact.last_contact_date,
    created_at: contact.created_at
  }))

  const filteredClients = filteredContacts.map(contact => ({
    ...contact,
    // Ensure all expected properties are present
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    dni_nif: contact.dni_nif,
    address_street: contact.address_street,
    address_city: contact.address_city,
    address_postal_code: contact.address_postal_code,
    address_country: contact.address_country,
    legal_representative: contact.legal_representative,
    client_type: contact.client_type,
    business_sector: contact.business_sector,
    how_found_us: contact.how_found_us,
    contact_preference: contact.contact_preference,
    preferred_language: contact.preferred_language,
    hourly_rate: contact.hourly_rate,
    payment_method: contact.payment_method,
    status: contact.status,
    relationship_type: contact.relationship_type,
    tags: contact.tags,
    internal_notes: contact.internal_notes,
    last_contact_date: contact.last_contact_date,
    created_at: contact.created_at
  }))

  return {
    clients,
    filteredClients,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter: relationshipFilter,
    setTypeFilter: setRelationshipFilter
  }
}

// Export the Contact type as Client for backward compatibility
export type { Contact as Client } from './useContacts'
