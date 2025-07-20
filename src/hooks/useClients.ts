
import { useContacts, type Contact } from './useContacts'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useClients')

// Client type que extiende Contact pero hace email opcional
export interface Client extends Contact {
  // Email ya es opcional en Contact, así que no necesitamos override
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
  // Email ya no es requerido
  const clients = contacts
    .filter(contact => contact.relationship_type === 'cliente')
    .map(contact => contact as Client)
    
  const filteredClients = filteredContacts
    .filter(contact => contact.relationship_type === 'cliente')
    .map(contact => contact as Client)

  logger.debug('useClients - Filtered clients:', {
    totalContacts: contacts.length,
    filteredClients: clients.length,
    contactsByRelationshipType: contacts.reduce((acc, c) => {
      acc[c.relationship_type] = (acc[c.relationship_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  })

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
