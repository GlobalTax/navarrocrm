
import { useCaseSearch } from '../search/useCaseSearch'
import type { Case } from './types'

export const useCasesFilters = (cases: Case[]) => {
  const {
    searchTerm,
    updateSearchTerm: setSearchTerm,
    activeFilters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    searchResults: filteredCases,
    searchResultsWithScore,
    isSearching,
    searchStats
  } = useCaseSearch(cases)

  // Mantener compatibilidad con la interfaz anterior
  const statusFilter = activeFilters.status || 'all'
  const practiceAreaFilter = activeFilters.practice_area || 'all'
  const solicitorFilter = activeFilters.responsible_solicitor_id || activeFilters.originating_solicitor_id || 'all'

  const setStatusFilter = (value: string) => {
    if (value === 'all') {
      clearFilter('status')
    } else if (value === 'active') {
      // Filtro especial para casos activos (no cerrados)
      updateFilter('status', 'open')
    } else {
      updateFilter('status', value)
    }
  }

  const setPracticeAreaFilter = (value: string) => {
    if (value === 'all') {
      clearFilter('practice_area')
    } else {
      updateFilter('practice_area', value)
    }
  }

  const setSolicitorFilter = (value: string) => {
    if (value === 'all') {
      clearFilter('responsible_solicitor_id')
      clearFilter('originating_solicitor_id')
    } else {
      updateFilter('responsible_solicitor_id', value)
    }
  }

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
    // Nuevas capacidades
    isSearching,
    searchStats,
    searchResultsWithScore,
    clearAllFilters
  }
}
