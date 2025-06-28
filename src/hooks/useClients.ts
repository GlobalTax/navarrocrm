
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
  
  // Filter contacts to only show those with relationship_type 'cliente'
  const clients = contacts.filter(contact => contact.relationship_type === 'cliente')
  const filteredClients = filteredContacts.filter(contact => contact.relationship_type === 'cliente')

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
