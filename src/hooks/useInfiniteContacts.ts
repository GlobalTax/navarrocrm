import { useInfiniteQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useDebounced } from '@/hooks/useDebounced'
import { Contact } from '@/hooks/useContacts'
import { parseEmailPreferences, defaultEmailPreferences } from '@/lib/typeUtils'

const PAGE_SIZE = 50

interface ContactsPage {
  contacts: Contact[]
  nextCursor: number | null
  hasMore: boolean
}

export const useInfiniteContacts = () => {
  const { user } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [relationshipFilter, setRelationshipFilter] = useState<string>('all')
  
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
    queryKey: ['infinite-contacts', user?.org_id, debouncedSearchTerm, statusFilter, relationshipFilter],
    queryFn: async ({ pageParam = 0 }): Promise<ContactsPage> => {
      console.log('🔄 Fetching contacts page:', pageParam, 'for org:', user?.org_id)
      
      if (!user?.org_id) {
        console.log('❌ No org_id available')
        return { contacts: [], nextCursor: null, hasMore: false }
      }

      let query = supabase
        .from('contacts')
        .select('*')
        .eq('org_id', user.org_id)
        .order('name', { ascending: true })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1)

      // Aplicar filtros
      if (debouncedSearchTerm) {
        query = query.or(`name.ilike.%${debouncedSearchTerm}%,email.ilike.%${debouncedSearchTerm}%,phone.ilike.%${debouncedSearchTerm}%`)
      }
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }
      
      if (relationshipFilter !== 'all') {
        query = query.eq('relationship_type', relationshipFilter)
      }

      const { data: contacts, error: contactsError } = await query

      if (contactsError) {
        console.error('❌ Error fetching contacts:', contactsError)
        throw contactsError
      }

      const typedContacts = (contacts || []).map(contact => ({
        ...contact,
        relationship_type: (contact.relationship_type as 'prospecto' | 'cliente' | 'ex_cliente') || 'prospecto',
        email_preferences: parseEmailPreferences(contact.email_preferences) || defaultEmailPreferences
      }))

      console.log('✅ Contacts page fetched:', typedContacts.length)

      return {
        contacts: typedContacts,
        nextCursor: typedContacts.length === PAGE_SIZE ? pageParam + 1 : null,
        hasMore: typedContacts.length === PAGE_SIZE
      }
    },
    enabled: !!user?.org_id,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  })

  // Flatten all pages into a single array
  const contacts = data?.pages.flatMap(page => page.contacts) || []

  return {
    contacts,
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
    relationshipFilter,
    setRelationshipFilter,
  }
}
