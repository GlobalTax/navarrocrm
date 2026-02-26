import { useInfiniteQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useDebounced } from '@/hooks/useDebounced'
import { Company } from '@/hooks/useCompanies'
import { parseEmailPreferences, defaultEmailPreferences } from '@/lib/typeUtils'

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
      if (!user?.org_id) {
        return { companies: [], nextCursor: null, hasMore: false }
      }

      // Una sola query RPC en lugar de N+1
      const { data: companiesData, error: rpcError } = await supabase.rpc('get_companies_with_contacts', {
        org_uuid: user.org_id,
        page_size: PAGE_SIZE,
        page_offset: pageParam * PAGE_SIZE,
        search_term: debouncedSearchTerm || null,
        status_filter: statusFilter !== 'all' ? statusFilter : null,
        sector_filter: sectorFilter !== 'all' ? sectorFilter : null,
      })

      if (rpcError) {
        console.error('❌ Error fetching companies:', rpcError)
        throw rpcError
      }

      const typedCompanies: Company[] = (companiesData || []).map((company: any) => ({
        ...company,
        client_type: 'empresa' as const,
        relationship_type: (company.relationship_type as 'prospecto' | 'cliente' | 'ex_cliente') || 'prospecto',
        email_preferences: parseEmailPreferences(company.email_preferences) || defaultEmailPreferences,
        primary_contact: company.primary_contact || null,
        total_contacts: Number(company.total_contacts) || 0,
      }))

      return {
        companies: typedCompanies,
        nextCursor: typedCompanies.length === PAGE_SIZE ? pageParam + 1 : null,
        hasMore: typedCompanies.length === PAGE_SIZE
      }
    },
    enabled: !!user?.org_id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
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
