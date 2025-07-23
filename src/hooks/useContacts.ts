import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { contactsDAL, type Contact } from '@/lib/dal'
import { useContactsDAL, useContactSearch } from '@/hooks/useContactsDAL'

export const useContacts = () => {
  const { user } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [relationshipFilter, setRelationshipFilter] = useState<string>('all')

  // Usar el nuevo DAL hook
  const { contacts, isLoading, error, refetch } = useContactsDAL(user?.org_id || '')

  // Filtrar contactos localmente
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.phone && contact.phone.includes(searchTerm))

    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
    const matchesRelationship = relationshipFilter === 'all' || contact.relationship_type === relationshipFilter

    return matchesSearch && matchesStatus && matchesRelationship
  })

  return {
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
    setRelationshipFilter,
  }
}

// Re-export Contact type for backward compatibility
export type { Contact }
