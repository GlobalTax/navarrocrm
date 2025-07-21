
import { useCasesQueries } from './cases/useCasesQueries'
import { useCasesMutations } from './cases/useCasesMutations'
import { useCasesFilters } from './cases/useCasesFilters'
import { createLogger } from '@/utils/logger'

export type { Case, CreateCaseData } from './cases/types'

const logger = createLogger('useCases')

/**
 * Hook principal para gestión completa de casos/expedientes
 * Combina consultas, mutaciones y filtros en una interfaz unificada
 * Implementa estrategias de optimización y logging para operaciones críticas
 * 
 * @returns {Object} Objeto con funciones y estado para gestión de casos
 * 
 * @example
 * ```typescript
 * const {
 *   cases,
 *   filteredCases,
 *   isLoading,
 *   error,
 *   createCase,
 *   updateCase,
 *   deleteCase,
 *   searchTerm,
 *   setSearchTerm,
 *   statusFilter,
 *   setStatusFilter,
 *   clearFilters,
 *   hasActiveFilters,
 *   refetch
 * } = useCases()
 * 
 * // Crear nuevo caso
 * await createCase({
 *   title: 'Nuevo Expediente',
 *   contact_id: 'contact-123',
 *   practice_area: 'civil'
 * })
 * 
 * // Filtrar casos
 * setSearchTerm('divorcio')
 * setStatusFilter('open')
 * 
 * // Limpiar filtros
 * if (hasActiveFilters) clearFilters()
 * ```
 * 
 * @since 1.0.0
 */
export const useCases = () => {
  const startTime = performance.now()
  
  try {
    logger.debug('Inicializando hook de casos', {
      timestamp: new Date().toISOString()
    })

    // Inicializar filtros primero para server-side filtering
    const serverFilters = useCasesFilters([])
    
    // Configurar consultas con filtros de servidor
    const { cases, isLoading, error, refetch } = useCasesQueries(serverFilters.serverFilters)
    
    // Configurar mutaciones para operaciones CRUD
    const mutations = useCasesMutations()
    
    // Filtros client-side para compatibilidad y funcionalidad existente
    const clientFilters = useCasesFilters(cases)

    const initializationTime = performance.now() - startTime
    
    logger.debug('Hook de casos inicializado exitosamente', {
      casesCount: cases.length,
      isLoading,
      hasError: !!error,
      initializationTime,
      hasActiveFilters: clientFilters.hasActiveFilters
    })

    // Métricas de rendimiento
    if (initializationTime > 50) {
      logger.warn('Inicialización de hook de casos tomó tiempo considerable', {
        initializationTime,
        casesCount: cases.length
      })
    }

    // Log de estado de filtros activos
    if (clientFilters.hasActiveFilters) {
      logger.debug('Filtros activos detectados', {
        searchTerm: clientFilters.searchTerm,
        statusFilter: clientFilters.statusFilter,
        practiceAreaFilter: clientFilters.practiceAreaFilter,
        solicitorFilter: clientFilters.solicitorFilter,
        filteredCount: clientFilters.filteredCases.length,
        totalCount: cases.length
      })
    }

    return {
      // Datos principales
      cases,
      isLoading,
      error,
      refetch,
      
      // Mutaciones
      ...mutations,
      
      // Filtros client-side (mantiene funcionalidad existente)
      filteredCases: clientFilters.filteredCases,
      searchTerm: clientFilters.searchTerm,
      setSearchTerm: clientFilters.setSearchTerm,
      statusFilter: clientFilters.statusFilter,
      setStatusFilter: clientFilters.setStatusFilter,
      practiceAreaFilter: clientFilters.practiceAreaFilter,
      setPracticeAreaFilter: clientFilters.setPracticeAreaFilter,
      solicitorFilter: clientFilters.solicitorFilter,
      setSolicitorFilter: clientFilters.setSolicitorFilter,
      clearFilters: clientFilters.clearFilters,
      hasActiveFilters: clientFilters.hasActiveFilters,
    }
  } catch (error) {
    const initializationTime = performance.now() - startTime
    
    logger.error('Error al inicializar hook de casos', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      initializationTime
    })
    
    // Re-lanzar el error para que sea manejado por el componente
    throw error
  }
}
