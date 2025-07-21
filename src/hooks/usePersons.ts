
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { Contact } from '@/hooks/useContacts'
import { parseEmailPreferences, defaultEmailPreferences } from '@/lib/typeUtils'
import { createLogger } from '@/utils/logger'

const logger = createLogger('usePersons')

export interface Person extends Contact {
  client_type: 'particular' | 'autonomo'
  company?: {
    id: string
    name: string
  } | null
}

export const usePersons = () => {
  const { user } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const { data: persons = [], isLoading, error, refetch } = useQuery({
    queryKey: ['persons', user?.org_id],
    queryFn: async () => {
      logger.debug('Fetching persons for org:', user?.org_id)
      
      if (!user?.org_id) {
        logger.warn('No org_id available')
        return []
      }

      const { data: personsData, error: personsError } = await supabase
        .from('contacts')
        .select(`
          *,
          company:company_id(
            id,
            name
          )
        `)
        .eq('org_id', user.org_id)
        .in('client_type', ['particular', 'autonomo'])
        .order('name', { ascending: true })

      if (personsError) {
        logger.error('Error fetching persons:', personsError)
        throw personsError
      }
      
      logger.info('Persons fetched successfully:', personsData?.length || 0)
      return personsData || []
    },
    enabled: !!user?.org_id,
    staleTime: 1000 * 60 * 5, // 5 minutos para personas
    select: (data) => data.map(person => ({
      ...person,
      client_type: (person.client_type as 'particular' | 'autonomo') || 'particular',
      relationship_type: (person.relationship_type as 'prospecto' | 'cliente' | 'ex_cliente') || 'prospecto',
      email_preferences: parseEmailPreferences(person.email_preferences) || defaultEmailPreferences,
      company: person.company ? {
        id: person.company.id,
        name: person.company.name
      } : null
    })),
    placeholderData: (previousData) => previousData ?? [],
    gcTime: 1000 * 60 * 10, // 10 minutos
  })

  const filteredPersons = useMemo(() => {
    return persons.filter(person => {
      const matchesSearch = !searchTerm || 
        person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (person.email && person.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (person.phone && person.phone.includes(searchTerm)) ||
        (person.company?.name && person.company.name.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === 'all' || person.status === statusFilter
      const matchesType = typeFilter === 'all' || person.client_type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [persons, searchTerm, statusFilter, typeFilter])

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
