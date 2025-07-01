import { useInfiniteQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useDebounced } from '@/hooks/useDebounced'
import { Person } from '@/hooks/usePersons'
import { parseEmailPreferences, defaultEmailPreferences } from '@/lib/typeUtils'

const PAGE_SIZE = 50

interface PersonsPage {
  persons: Person[]
  nextCursor: number | null
  hasMore: boolean
}

export const useInfinitePersons = () => {
  const { user } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  
  // Debounce search to avoid excessive API calls
  const debouncedSearchTerm = useDebounced(searchTerm, 300)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['infinite-persons', user?.org_id, debouncedSearchTerm, statusFilter, typeFilter],
    queryFn: async ({ pageParam = 0 }): Promise<PersonsPage> => {
      console.log('🔄 Fetching persons page:', pageParam, 'for org:', user?.org_id)
      
      if (!user?.org_id) {
        console.log('❌ No org_id available')
        return { persons: [], nextCursor: null, hasMore: false }
      }

      let query = supabase
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
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1)

      // Aplicar filtros
      if (debouncedSearchTerm) {
        query = query.or(`name.ilike.%${debouncedSearchTerm}%,email.ilike.%${debouncedSearchTerm}%,phone.ilike.%${debouncedSearchTerm}%`)
      }
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }
      
      if (typeFilter !== 'all') {
        query = query.eq('client_type', typeFilter)
      }

      const { data: personsData, error: personsError } = await query

      if (personsError) {
        console.error('❌ Error fetching persons:', personsError)
        throw personsError
      }

      const typedPersons = (personsData || []).map(person => ({
        ...person,
        client_type: (person.client_type as 'particular' | 'autonomo') || 'particular',
        relationship_type: (person.relationship_type as 'prospecto' | 'cliente' | 'ex_cliente') || 'prospecto',
        email_preferences: parseEmailPreferences(person.email_preferences) || defaultEmailPreferences,
        company: person.company ? {
          id: person.company.id,
          name: person.company.name
        } : null
      }))

      console.log('✅ Persons page fetched:', typedPersons.length)

      return {
        persons: typedPersons,
        nextCursor: typedPersons.length === PAGE_SIZE ? pageParam + 1 : null,
        hasMore: typedPersons.length === PAGE_SIZE
      }
    },
    enabled: !!user?.org_id,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  })

  const persons = data?.pages.flatMap(page => page.persons) || []

  return {
    persons,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
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
