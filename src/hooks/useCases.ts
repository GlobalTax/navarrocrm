
import { useCasesQueries } from './cases/useCasesQueries'
import { useCasesMutations } from './cases/useCasesMutations'
import { useCasesFilters } from './cases/useCasesFilters'

export type { Case, CreateCaseData } from './cases/types'

export const useCases = () => {
  const { cases, isLoading, error, refetch } = useCasesQueries()
  const mutations = useCasesMutations()
  const filters = useCasesFilters(cases)

  return {
    cases,
    isLoading,
    error,
    refetch,
    ...mutations,
    ...filters,
  }
}
