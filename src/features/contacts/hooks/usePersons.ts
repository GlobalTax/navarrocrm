/**
 * Persons Hooks
 * 
 * Hooks específicos para personas físicas
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useApp } from '@/contexts/AppContext'
import { contactsService } from '../services/ContactsService'
import { Person } from '../types'

/**
 * Hook para gestionar personas físicas
 */
export const usePersons = () => {
  const { user } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const { data: persons = [], isLoading, error, refetch } = useQuery({
    queryKey: ['persons', user?.org_id],
    queryFn: async (): Promise<Person[]> => {
      console.log('🔄 [usePersons] Fetching persons for org:', user?.org_id)
      
      if (!user?.org_id) {
        console.log('❌ [usePersons] No org_id available')
        return []
      }

      return contactsService.getPersons(user.org_id)
    },
    enabled: !!user?.org_id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })

  const filteredPersons = persons.filter(person => {
    // Verificación segura de búsqueda
    const matchesSearch = !searchTerm || 
      person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (person.email && person.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (person.phone && person.phone.includes(searchTerm)) ||
      (person.company?.name && person.company.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || person.status === statusFilter

    const matchesType = typeFilter === 'all' || person.client_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  return {
    persons,
    filteredPersons,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
  }
}

// Re-export type
export type { Person }