
import { useInfiniteQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useDebounced } from '@/hooks/useDebounced'
import { Company } from '@/hooks/useCompanies'

const PAGE_SIZE = 50

interface CompaniesPage {
  companies: Company[]
  nextCursor: number | null
  hasMore: boolean
}

export const useInfiniteCompanies = () => {
  const { user } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sectorFilter, setSectorFilter] = useState<string>('all')
  
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
    queryKey: ['infinite-companies', user?.org_id, debouncedSearchTerm, statusFilter, sectorFilter],
    queryFn: async ({ pageParam = 0 }): Promise<CompaniesPage> => {
      console.log('🔄 Fetching companies page:', pageParam, 'for org:', user?.org_id)
      
      if (!user?.org_id) {
        console.log('❌ No org_id available')
        return { companies: [], nextCursor: null, hasMore: false }
      }

      let query = supabase
        .from('contacts')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('client_type', 'empresa')
        .order('name', { ascending: true })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1)

      // Aplicar filtros
      if (debouncedSearchTerm) {
        query = query.or(`name.ilike.%${debouncedSearchTerm}%,email.ilike.%${debouncedSearchTerm}%,phone.ilike.%${debouncedSearchTerm}%`)
      }
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }
      
      if (sectorFilter !== 'all') {
        query = query.eq('business_sector', sectorFilter)
      }

      const { data: companiesData, error: companiesError } = await query

      if (companiesError) {
        console.error('❌ Error fetching companies:', companiesError)
        throw companiesError
      }

      // Procesar datos de contactos para cada empresa
      const companiesWithContacts = await Promise.all(
        (companiesData || []).map(async (company) => {
          try {
            const { data: contactsData } = await supabase
              .from('contacts')
              .select('id, name, email, phone')
              .eq('company_id', company.id)
              .eq('org_id', user.org_id)
              .limit(1)

            const { count: totalContacts } = await supabase
              .from('contacts')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', company.id)
              .eq('org_id', user.org_id)

            return {
              ...company,
              client_type: 'empresa' as const,
              relationship_type: (company.relationship_type as 'prospecto' | 'cliente' | 'ex_cliente') || 'prospecto',
              primary_contact: contactsData?.[0] || null,
              total_contacts: totalContacts || 0
            }
          } catch (error) {
            console.error('❌ Error processing company', company.name, ':', error)
            return {
              ...company,
              client_type: 'empresa' as const,
              relationship_type: (company.relationship_type as 'prospecto' | 'cliente' | 'ex_cliente') || 'prospecto',
              primary_contact: null,
              total_contacts: 0
            }
          }
        })
      )

      console.log('✅ Companies page fetched:', companiesWithContacts.length)

      return {
        companies: companiesWithContacts,
        nextCursor: companiesWithContacts.length === PAGE_SIZE ? pageParam + 1 : null,
        hasMore: companiesWithContacts.length === PAGE_SIZE
      }
    },
    enabled: !!user?.org_id,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  })

  const companies = data?.pages.flatMap(page => page.companies) || []

  return {
    companies,
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
    sectorFilter,
    setSectorFilter,
  }
}
