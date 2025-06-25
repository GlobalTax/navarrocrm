
import { useContacts, Contact } from './useContacts'

// Backward compatibility hook for existing components
export const useClients = () => {
  const { 
    contacts, 
    filteredContacts,
    isLoading, 
    error, 
    hasMore,
    loadMore,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    relationshipFilter,
    setRelationshipFilter
  } = useContacts()
  
  // Filter contacts to only show those with relationship_type 'cliente'
  const clients = contacts.filter((contact: Contact) => contact.relationship_type === 'cliente')
  const filteredClients = filteredContacts.filter((contact: Contact) => contact.relationship_type === 'cliente')

  return {
    clients,
    filteredClients,
    isLoading,
    error,
    hasMore,
    loadMore,
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
