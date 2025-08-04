/**
 * useCasesQueries - Hook para consultas de casos
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useApp } from '@/contexts/AppContext'
import { casesService } from '../services'
import { Case, CaseSearchParams } from '../types'

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
        console.debug('No org_id disponible para obtener casos')
        return []
      }
      
      console.log('Obteniendo casos', { orgId: user.org_id, filters })
      
      const searchParams: CaseSearchParams = {}

      // Aplicar filtros
      if (filters.searchTerm) {
        searchParams.search = filters.searchTerm
      }
      
      if (filters.statusFilter && filters.statusFilter !== 'all') {
        if (filters.statusFilter === 'active') {
          searchParams.status = ['open', 'on_hold']
        } else {
          searchParams.status = [filters.statusFilter as any]
        }
      }
      
      if (filters.practiceAreaFilter && filters.practiceAreaFilter !== 'all') {
        searchParams.practice_area = [filters.practiceAreaFilter]
      }
      
      if (filters.solicitorFilter && filters.solicitorFilter !== 'all') {
        searchParams.responsible_solicitor_id = filters.solicitorFilter
      }

      searchParams.limit = 1000 // Límite temporal hasta implementar paginación completa

      return await casesService.getCases(searchParams, user.org_id)
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
        
        const searchParams: CaseSearchParams = {
          limit: PAGE_SIZE,
          offset: currentPage * PAGE_SIZE
        }

        // Aplicar filtros
        if (filters.searchTerm) {
          searchParams.search = filters.searchTerm
        }
        
        if (filters.statusFilter && filters.statusFilter !== 'all') {
          if (filters.statusFilter === 'active') {
            searchParams.status = ['open', 'on_hold']
          } else {
            searchParams.status = [filters.statusFilter as any]
          }
        }
        
        if (filters.practiceAreaFilter && filters.practiceAreaFilter !== 'all') {
          searchParams.practice_area = [filters.practiceAreaFilter]
        }
        
        if (filters.solicitorFilter && filters.solicitorFilter !== 'all') {
          searchParams.responsible_solicitor_id = filters.solicitorFilter
        }

        const data = await casesService.getCases(searchParams, user.org_id)
        
        return {
          data,
          count: data.length,
          hasMore: data.length === PAGE_SIZE
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