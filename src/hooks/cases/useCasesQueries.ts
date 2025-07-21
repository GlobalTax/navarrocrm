
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { createLogger } from '@/utils/logger'
import type { Case } from './types'

/**
 * Resultado de consulta paginada de casos
 * @interface CasesQueryResult
 */
interface CasesQueryResult {
  /** Array de casos */
  data: Case[]
  /** Número total de casos */
  count: number
  /** Si hay más páginas disponibles */
  hasMore: boolean
}

/**
 * Filtros disponibles para la consulta de casos
 * @interface CasesFilters
 */
interface CasesFilters {
  /** Término de búsqueda en título y número de expediente */
  searchTerm?: string
  /** Filtro por estado del caso */
  statusFilter?: string
  /** Filtro por área de práctica */
  practiceAreaFilter?: string
  /** Filtro por procurador responsable */
  solicitorFilter?: string
}

/**
 * Opciones de configuración para useCasesQueries
 * @interface UseCasesQueriesOptions
 */
interface UseCasesQueriesOptions {
  /** Habilitar la consulta */
  enabled?: boolean
  /** Tiempo de cache en milisegundos */
  staleTime?: number
  /** Límite de casos por consulta */
  limit?: number
}

/**
 * Hook para consultar y gestionar casos de la organización
 * Proporciona funcionalidades avanzadas de filtrado, búsqueda y paginación
 * 
 * @param {CasesFilters} filters - Filtros para aplicar a la consulta
 * @param {UseCasesQueriesOptions} options - Opciones de configuración
 * @returns {Object} Resultado con casos, estado de carga y funciones
 * 
 * @example
 * ```tsx
 * const { cases, isLoading, error, refetch } = useCasesQueries({
 *   searchTerm: 'divorcio',
 *   statusFilter: 'active',
 *   practiceAreaFilter: 'family'
 * })
 * 
 * if (isLoading) return <div>Cargando casos...</div>
 * if (error) return <div>Error: {error.message}</div>
 * 
 * return (
 *   <div>
 *     {cases.map(case => (
 *       <CaseCard key={case.id} case={case} />
 *     ))}
 *   </div>
 * )
 * ```
 * 
 * @throws {Error} Cuando no se puede acceder a los datos del usuario
 * @throws {Error} Cuando los filtros son inválidos
 */
export const useCasesQueries = (filters: CasesFilters = {}, options: UseCasesQueriesOptions = {}) => {
  const logger = createLogger('useCasesQueries')
  const { user } = useApp()
  const PAGE_SIZE = options.limit ?? 25

  // Validación de parámetros
  if (filters && typeof filters !== 'object') {
    logger.error('filters debe ser un objeto', { filters: typeof filters })
    throw new Error('El parámetro filters debe ser un objeto válido')
  }

  if (filters.searchTerm && typeof filters.searchTerm !== 'string') {
    logger.error('searchTerm debe ser una cadena', { searchTerm: typeof filters.searchTerm })
    throw new Error('El filtro searchTerm debe ser una cadena válida')
  }

  if (filters.searchTerm && filters.searchTerm.length > 100) {
    logger.warn('searchTerm muy largo, truncando', { length: filters.searchTerm.length })
    filters.searchTerm = filters.searchTerm.substring(0, 100)
  }

  if (options.limit && (options.limit < 1 || options.limit > 1000)) {
    logger.warn('Límite fuera de rango (1-1000), usando valor por defecto', { limit: options.limit })
  }

  if (options.staleTime && (options.staleTime < 0 || options.staleTime > 1000 * 60 * 60)) {
    logger.warn('staleTime fuera de rango recomendado (0-3600000ms)', { staleTime: options.staleTime })
  }

  // Validación de contexto
  if (!user) {
    logger.error('Usuario no encontrado en el contexto')
    throw new Error('Usuario no autenticado')
  }

  const { data: cases = [], isLoading, error, refetch } = useQuery({
    queryKey: ['cases', user?.org_id, filters],
    queryFn: async (): Promise<Case[]> => {
      if (!user?.org_id) {
        console.log('📋 No org_id disponible para obtener casos')
        return []
      }
      
      console.log('📋 Obteniendo casos para org:', user.org_id, 'con filtros:', filters)
      
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
        console.error('❌ Error fetching cases:', error)
        throw error
      }
      
      console.log('✅ Casos obtenidos:', data?.length || 0)
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
