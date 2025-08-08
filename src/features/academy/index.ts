/**
 * Academy Feature Module
 * 
 * Sistema de formación y aprendizaje
 */

// Pages - reexport from real pages to avoid duplicados
export { default as AcademiaPage } from '../../pages/Academia'
export { default as AcademiaAdminPage } from '../../pages/AcademiaAdmin'

// Components
export { AcademiaContent } from './components/AcademiaContent'

// Hooks - usar los hooks reales implementados
export { useAcademyQueries } from '../../hooks/academy/useAcademyQueries'
export { useAcademyAdminQueries } from '../../hooks/academy/useAcademyAdminQueries'
export { useAcademyMutations } from '../../hooks/academy/useAcademyMutations'
export { useEnhancedAcademiaAdminState } from '../../hooks/academy/useEnhancedAcademiaAdminState'

// Types (placeholder)
// export type {
//   Course,
//   Lesson,
//   Category,
//   UserProgress
// } from './types'

