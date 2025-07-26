/**
 * Cases Feature Module
 * 
 * Gestión de expedientes y casos legales
 */

// Components (pages)
export { default as CasesPage } from './pages/CasesPage'

// Components
export { CaseTable } from './components/CaseTable'
export { CasesFilters } from './components/CasesFilters'

// Hooks
export { useCasesList } from './hooks'

export type { Case, CreateCaseData } from '@/hooks/useCases'
// Types
// export type {
//   Case,
//   CaseStatus,
//   CaseForm,
//   CaseTemplate
// } from './types'