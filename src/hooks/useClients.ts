
import { useContacts, type Contact } from './useContacts'
import { Client } from '@/types/shared/clientTypes'

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

  console.log('useClients - Total contacts:', contacts.length)
  console.log('useClients - Filtered clients:', clients.length)
  console.log('useClients - Contacts by relationship type:', contacts.reduce((acc, c) => {
    acc[c.relationship_type] = (acc[c.relationship_type] || 0) + 1
    return acc
  }, {} as Record<string, number>))

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

// Export both types for general use
export type { Contact, Client }
