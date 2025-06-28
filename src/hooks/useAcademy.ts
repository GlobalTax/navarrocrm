
// Mantenemos este archivo para compatibilidad hacia atrás
export { 
  useAcademyQueries,
  useAcademyAdminQueries, 
  useAcademyMutations 
} from './academy'

// Exports específicos para mantener compatibilidad
export const useAcademyCategories = () => {
  const { usePublishedCategories } = useAcademyQueries()
  return usePublishedCategories()
}

export const useAcademyCourses = (categoryId?: string) => {
  const { usePublishedCourses } = useAcademyQueries()
  return usePublishedCourses(categoryId)
}

export const useUserProgress = () => {
  const { useUserProgress } = useAcademyQueries()
  return useUserProgress()
}

// Import necesario para que funcione
import { useAcademyQueries } from './academy/useAcademyQueries'
