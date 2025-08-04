/**
 * Cases Feature - Barrel Export
 * Sistema de gestión de expedientes/casos
 */

// Types
export * from './types'

// Constants
export * from './constants'

// Services
export { CasesService } from './services'

// Hooks
export { useCases, useCasesMutations, useCasesQueries, useCasesFilters } from './hooks'

// Utils
export { calculateCaseStats, formatCaseStatus, getCasePriorityColor, getCaseStatusColor } from './utils'

// Components
export * from './components'

// Re-export legacy hooks for compatibility
export type { Case, CreateCaseData, UpdateCaseData, CaseFilters } from './types'