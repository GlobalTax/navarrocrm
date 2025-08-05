
import { useCasesQueries } from './cases/useCasesQueries'
import { useCasesMutations } from './cases/useCasesMutations'
import { useCasesFilters } from './cases/useCasesFilters'

export type { Case, CreateCaseData } from './cases/types'

export const useCases = () => {
  const filters = useCasesFilters([]) // Inicializar filtros primero
  const { cases, isLoading, error, refetch } = useCasesQueries(filters.serverFilters)
  const mutations = useCasesMutations()
  const clientFilters = useCasesFilters(cases) // Filtros para client-side

  return {
    cases,
    isLoading,
    error,
    refetch,
    ...mutations,
    // Usar filtros client-side que mantienen la funcionalidad existente
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
}
