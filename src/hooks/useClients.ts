
import { useMemo } from 'react'
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
  const clients = useMemo(() => 
    contacts
      .filter(contact => contact.relationship_type === 'cliente')
      .map(contact => contact as Client),
    [contacts]
  )
    
  const filteredClients = useMemo(() =>
    filteredContacts
      .filter(contact => contact.relationship_type === 'cliente')
      .map(contact => contact as Client),
    [filteredContacts]
  )

  // Only log in development mode to reduce production overhead
  if (process.env.NODE_ENV === 'development') {
    console.log('useClients - Total contacts:', contacts.length)
    console.log('useClients - Filtered clients:', clients.length)
  }

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
