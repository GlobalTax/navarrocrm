
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { casesLogger } from '@/utils/logging'
import type { Case } from './types'

interface CasesQueryResult {
  data: Case[]
  count: number
  hasMore: boolean
}

interface CasesFilters {
  searchTerm?: string
  statusFilter?: string
  practiceAreaFilter?: string
  solicitorFilter?: string
}

export const useCasesQueries = (filters: CasesFilters = {}) => {
  const { user } = useApp()
  const PAGE_SIZE = 25

  const { data: cases = [], isLoading, error, refetch } = useQuery({
    queryKey: ['cases', user?.org_id, filters],
    queryFn: async (): Promise<Case[]> => {
      if (!user?.org_id) {
        casesLogger.debug('No org_id disponible para obtener casos')
        return []
      }
      
      casesLogger.info('Obteniendo casos', { orgId: user.org_id, filters })
      
      let query = supabase
        .from('cases')
        .select(`
          *,
          contact:contacts(
            id,
            name,
            email,
            phone
          )
        `)

      // Aplicar filtros
      if (filters.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,matter_number.ilike.%${filters.searchTerm}%`)
      }
      
      if (filters.statusFilter && filters.statusFilter !== 'all') {
        query = query.eq('status', filters.statusFilter)
      }
      
      if (filters.practiceAreaFilter && filters.practiceAreaFilter !== 'all') {
        query = query.eq('practice_area', filters.practiceAreaFilter)
      }
      
      if (filters.solicitorFilter && filters.solicitorFilter !== 'all') {
        query = query.eq('responsible_solicitor_id', filters.solicitorFilter)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(1000) // Límite temporal hasta implementar paginación completa

      if (error) {
        casesLogger.error('Error obteniendo casos', { error })
        throw error
      }

      casesLogger.info('Casos obtenidos exitosamente', { count: data?.length || 0 })
      return (data || []) as unknown as Case[]
    },
    enabled: !!user?.org_id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })

  // Hook para paginación infinita (para implementación futura)
  const useInfiniteCases = () => {
    return useInfiniteQuery<CasesQueryResult, Error, any, (string | CasesFilters)[], number>({
      queryKey: ['cases-infinite', user?.org_id, filters],
      initialPageParam: 0,
      queryFn: async ({ pageParam = 0 }): Promise<CasesQueryResult> => {
        if (!user?.org_id) return { data: [], count: 0, hasMore: false }
        
        const currentPage = typeof pageParam === 'number' ? pageParam : 0
        
        let query = supabase
          .from('cases')
          .select(`
            *,
            contact:contacts(
              id,
              name,
              email,
              phone
            )
          `, { count: 'exact' })

        // Aplicar filtros
        if (filters.searchTerm) {
          query = query.or(`title.ilike.%${filters.searchTerm}%,matter_number.ilike.%${filters.searchTerm}%`)
        }
        
        if (filters.statusFilter && filters.statusFilter !== 'all') {
          query = query.eq('status', filters.statusFilter)
        }
        
        if (filters.practiceAreaFilter && filters.practiceAreaFilter !== 'all') {
          query = query.eq('practice_area', filters.practiceAreaFilter)
        }
        
        if (filters.solicitorFilter && filters.solicitorFilter !== 'all') {
          query = query.eq('responsible_solicitor_id', filters.solicitorFilter)
        }

        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1)

        if (error) throw error
        
        return {
          data: (data || []) as unknown as Case[],
          count: count || 0,
          hasMore: (count || 0) > (currentPage + 1) * PAGE_SIZE
        }
      },
      getNextPageParam: (lastPage: CasesQueryResult, pages) => 
        lastPage.hasMore ? pages.length : undefined,
      enabled: !!user?.org_id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })
  }

  return {
    cases,
    isLoading,
    error,
    refetch,
    useInfiniteCases
  }
}
