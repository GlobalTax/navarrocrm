
// Re-export all academy admin hooks from their specific files
export { useAcademyMutations as useAcademyCategoriesMutation } from './academy/useAcademyMutations'
export { useAcademyMutations as useAcademyCoursesMutation } from './academy/useAcademyMutations' 
export { useAcademyMutations as useAcademyLessonsMutation } from './academy/useAcademyMutations'

// Mantener compatibilidad hacia atrás
export const useAcademyAdminMutations = () => {
  return useAcademyMutations()
}

import { useAcademyMutations } from './academy/useAcademyMutations'
