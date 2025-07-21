import { useState, useMemo, useCallback } from 'react'
import { useDebounced } from '@/hooks/useDebounced'
import { createLogger } from '@/utils/logger'
import type { Case } from './types'

/**
 * Configuración de filtros para casos
 * @interface CasesFiltersConfig
 */
export interface CasesFiltersConfig {
  /** Término de búsqueda inicial */
  initialSearchTerm?: string
  /** Filtro de estado inicial */
  initialStatusFilter?: string
  /** Filtro de área de práctica inicial */
  initialPracticeAreaFilter?: string
  /** Filtro de abogado inicial */
  initialSolicitorFilter?: string
  /** Tiempo de debounce en milisegundos */
  debounceTime?: number
  /** Habilitar filtrado client-side */
  enableClientSideFiltering?: boolean
}

/**
 * Resultado del hook useCasesFilters
 * @interface CasesFiltersResult
 */
export interface CasesFiltersResult {
  /** Casos filtrados */
  filteredCases: Case[]
  /** Término de búsqueda actual */
  searchTerm: string
  /** Función para actualizar término de búsqueda */
  setSearchTerm: (term: string) => void
  /** Filtro de estado actual */
  statusFilter: string
  /** Función para actualizar filtro de estado */
  setStatusFilter: (status: string) => void
  /** Filtro de área de práctica actual */
  practiceAreaFilter: string
  /** Función para actualizar filtro de área de práctica */
  setPracticeAreaFilter: (area: string) => void
  /** Filtro de abogado actual */
  solicitorFilter: string
  /** Función para actualizar filtro de abogado */
  setSolicitorFilter: (solicitor: string) => void
  /** Filtros para consultas server-side */
  serverFilters: object
  /** Función para limpiar todos los filtros */
  clearFilters: () => void
  /** Indica si hay filtros activos */
  hasActiveFilters: boolean
  /** Función para restablecer filtros a valores iniciales */
  resetToDefaults: () => void
}

/**
 * Hook para filtrado avanzado de casos
 * Proporciona filtrado client-side y server-side con debouncing y validación
 * 
 * @param {Case[]} cases - Array de casos para filtrar
 * @param {CasesFiltersConfig} config - Configuración de filtros
 * @returns {CasesFiltersResult} Resultado con casos filtrados y funciones de control
 * 
 * @example
 * ```tsx
 * const {
 *   filteredCases,
 *   searchTerm,
 *   setSearchTerm,
 *   clearFilters,
 *   hasActiveFilters
 * } = useCasesFilters(cases, {
 *   debounceTime: 300,
 *   enableClientSideFiltering: true
 * })
 * ```
 * 
 * @example
 * Con configuración inicial:
 * ```tsx
 * const filters = useCasesFilters(cases, {
 *   initialStatusFilter: 'open',
 *   initialPracticeAreaFilter: 'legal',
 *   debounceTime: 500
 * })
 * ```
 * 
 * @throws {Error} Cuando cases no es un array válido
 */
export const useCasesFilters = (cases: Case[], config: CasesFiltersConfig = {}): CasesFiltersResult => {
  const logger = createLogger('useCasesFilters')

  // Validación de parámetros
  if (!Array.isArray(cases)) {
    logger.error('cases debe ser un array', { cases: typeof cases })
    throw new Error('El parámetro cases debe ser un array válido')
  }

  // Configuración con valores por defecto
  const {
    initialSearchTerm = '',
    initialStatusFilter = 'active',
    initialPracticeAreaFilter = 'all',
    initialSolicitorFilter = 'all',
    debounceTime = 500,
    enableClientSideFiltering = true
  } = config

  // Validación de configuración
  if (debounceTime < 0 || debounceTime > 2000) {
    logger.warn('debounceTime fuera del rango recomendado (0-2000ms)', { debounceTime })
  }

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter)
  const [practiceAreaFilter, setPracticeAreaFilter] = useState<string>(initialPracticeAreaFilter)
  const [solicitorFilter, setSolicitorFilter] = useState<string>(initialSolicitorFilter)

  // Debounce search term para mejorar rendimiento
  const debouncedSearchTerm = useDebounced(searchTerm, debounceTime)

  // Filtros para server-side queries con validación
  const serverFilters = useMemo(() => {
    const filters = {
      searchTerm: debouncedSearchTerm,
      statusFilter,
      practiceAreaFilter,
      solicitorFilter
    }

    logger.debug('Filtros server-side actualizados', filters)
    return filters
  }, [debouncedSearchTerm, statusFilter, practiceAreaFilter, solicitorFilter, logger])

  // Filtrado client-side optimizado con validación
  const filteredCases = useMemo(() => {
    try {
      if (!enableClientSideFiltering) {
        logger.debug('Filtrado client-side deshabilitado, devolviendo casos originales')
        return cases
      }

      const filtered = cases.filter(case_ => {
        // Validación de caso
        if (!case_ || typeof case_ !== 'object') {
          logger.warn('Caso inválido encontrado durante filtrado', { case: case_ })
          return false
        }

        const matchesSearch = !debouncedSearchTerm || 
          case_.title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          case_.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          case_.contact?.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          case_.matter_number?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        
        const matchesStatus = statusFilter === 'all' || 
          (statusFilter === 'active' && case_.status !== 'closed') ||
          (statusFilter === 'closed' && case_.status === 'closed') ||
          case_.status === statusFilter
          
        const matchesPracticeArea = practiceAreaFilter === 'all' || case_.practice_area === practiceAreaFilter
        const matchesSolicitor = solicitorFilter === 'all' || 
          case_.responsible_solicitor_id === solicitorFilter ||
          case_.originating_solicitor_id === solicitorFilter

        return matchesSearch && matchesStatus && matchesPracticeArea && matchesSolicitor
      })

      logger.debug('Filtrado completado', { 
        originalCount: cases.length, 
        filteredCount: filtered.length,
        filtersApplied: {
          search: !!debouncedSearchTerm,
          status: statusFilter !== 'all',
          practiceArea: practiceAreaFilter !== 'all',
          solicitor: solicitorFilter !== 'all'
        }
      })

      return filtered
    } catch (error) {
      logger.error('Error durante filtrado de casos', error)
      return cases // Fallback a casos originales
    }
  }, [cases, debouncedSearchTerm, statusFilter, practiceAreaFilter, solicitorFilter, enableClientSideFiltering, logger])

  // Función para limpiar filtros con callback
  const clearFilters = useCallback(() => {
    logger.info('Limpiando todos los filtros')
    setSearchTerm('')
    setStatusFilter('active')
    setPracticeAreaFilter('all')
    setSolicitorFilter('all')
  }, [logger])

  // Función para restablecer a valores por defecto
  const resetToDefaults = useCallback(() => {
    logger.info('Restableciendo filtros a valores por defecto')
    setSearchTerm(initialSearchTerm)
    setStatusFilter(initialStatusFilter)
    setPracticeAreaFilter(initialPracticeAreaFilter)
    setSolicitorFilter(initialSolicitorFilter)
  }, [initialSearchTerm, initialStatusFilter, initialPracticeAreaFilter, initialSolicitorFilter, logger])

  // Cálculo de filtros activos con validación
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      debouncedSearchTerm || 
      statusFilter !== initialStatusFilter || 
      practiceAreaFilter !== initialPracticeAreaFilter || 
      solicitorFilter !== initialSolicitorFilter
    )
  }, [debouncedSearchTerm, statusFilter, practiceAreaFilter, solicitorFilter, 
      initialStatusFilter, initialPracticeAreaFilter, initialSolicitorFilter])

  return {
    filteredCases,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    practiceAreaFilter,
    setPracticeAreaFilter,
    solicitorFilter,
    setSolicitorFilter,
    serverFilters,
    clearFilters,
    hasActiveFilters,
    resetToDefaults
  }
}