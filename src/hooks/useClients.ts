
import { useContacts, type Contact } from './useContacts'

// Client type que extiende Contact pero hace email requerido
export interface Client extends Omit<Contact, 'email'> {
  email: string
}

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
  
  // Filter contacts to only show those with relationship_type 'cliente'
  // and convert to Client type (ensuring email is not null)
  const clients = contacts
    .filter(contact => contact.relationship_type === 'cliente' && contact.email)
    .map(contact => ({ ...contact, email: contact.email! })) as Client[]
    
  const filteredClients = filteredContacts
    .filter(contact => contact.relationship_type === 'cliente' && contact.email)
    .map(contact => ({ ...contact, email: contact.email! })) as Client[]

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

// Export Contact type for general use
export type { Contact }
