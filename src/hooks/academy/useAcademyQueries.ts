
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { createLogger } from '@/utils/logger'
import type { AcademyCategory, AcademyCourse, UserProgress } from '@/types/academy'

/**
 * Opciones de configuración para useAcademyQueries
 * @interface UseAcademyQueriesOptions
 */
export interface UseAcademyQueriesOptions {
  /** Habilitar consultas */
  enabled?: boolean
  /** Tiempo de cache en milisegundos */
  staleTime?: number
}

/**
 * Hook para consultar datos de la academia
 * Proporciona acceso a categorías, cursos y progreso del usuario con cache optimizado
 * 
 * @param {UseAcademyQueriesOptions} options - Opciones de configuración
 * @returns {Object} Funciones para consultar datos de academia
 * 
 * @example
 * ```tsx
 * const { usePublishedCategories, usePublishedCourses, useUserProgress } = useAcademyQueries({
 *   staleTime: 300000 // 5 minutos
 * })
 * 
 * const { data: categories } = usePublishedCategories()
 * const { data: courses } = usePublishedCourses('category-id')
 * const { data: progress } = useUserProgress()
 * ```
 * 
 * @throws {Error} Cuando no se puede acceder a los datos del usuario
 */
export const useAcademyQueries = (options: UseAcademyQueriesOptions = {}) => {
  const logger = createLogger('useAcademyQueries')
  const { user } = useApp()

  // Validación de parámetros
  if (options.staleTime && (options.staleTime < 0 || options.staleTime > 1000 * 60 * 60)) {
    logger.warn('staleTime fuera de rango recomendado (0-3600000ms)', { staleTime: options.staleTime })
  }

  // Validación de contexto
  if (!user) {
    logger.error('Usuario no encontrado en el contexto')
    throw new Error('Usuario no autenticado')
  }

  /**
   * Obtiene categorías activas y publicadas de la academia
   * @returns {Object} Query para categorías publicadas
   */
  const usePublishedCategories = () => {
    return useQuery({
      queryKey: ['academy-categories', user?.org_id],
      queryFn: async (): Promise<AcademyCategory[]> => {
        try {
          if (!user?.org_id) {
            logger.warn('org_id no encontrado para obtener categorías')
            throw new Error('No organization found')
          }

          logger.info('Obteniendo categorías de academia', { orgId: user.org_id })

          const { data, error } = await supabase
            .from('academy_categories')
            .select('*')
            .eq('org_id', user.org_id)
            .eq('is_active', true)
            .order('sort_order', { ascending: true })

          if (error) {
            logger.error('Error al obtener categorías de academia', error)
            throw error
          }

          const categories = data || []
          logger.info('Categorías de academia obtenidas', { count: categories.length })
          
          return categories
        } catch (err) {
          logger.error('Error en queryFn de categorías', err)
          throw err
        }
      },
      enabled: !!user?.org_id && (options.enabled ?? true),
      staleTime: options.staleTime ?? 1000 * 60 * 10, // 10 minutos por defecto
      retry: (failureCount, error) => {
        if (failureCount >= 3) {
          logger.error('Máximo número de reintentos alcanzado para categorías', { failureCount, error })
          return false
        }
        return true
      }
    })
  }

  /**
   * Obtiene cursos publicados, opcionalmente filtrados por categoría
   * @param {string} categoryId - ID opcional de categoría para filtrar
   * @returns {Object} Query para cursos publicados
   */
  const usePublishedCourses = (categoryId?: string) => {
    // Validación de parámetros opcionales
    if (categoryId && typeof categoryId !== 'string') {
      logger.error('categoryId debe ser una cadena válida', { categoryId: typeof categoryId })
      throw new Error('El parámetro categoryId debe ser una cadena válida')
    }

    return useQuery({
      queryKey: ['academy-courses', user?.org_id, categoryId],
      queryFn: async (): Promise<AcademyCourse[]> => {
        try {
          if (!user?.org_id) {
            logger.warn('org_id no encontrado para obtener cursos')
            throw new Error('No organization found')
          }

          logger.info('Obteniendo cursos de academia', { 
            orgId: user.org_id, 
            categoryId: categoryId || 'todas' 
          })

          let query = supabase
            .from('academy_courses')
            .select(`
              *,
              academy_categories (
                name,
                color
              )
            `)
            .eq('org_id', user.org_id)
            .eq('is_published', true)

          if (categoryId) {
            query = query.eq('category_id', categoryId)
          }

          const { data, error } = await query.order('created_at', { ascending: false })

          if (error) {
            logger.error('Error al obtener cursos de academia', error)
            throw error
          }
          
          // Transform data to match our types
          const courses = (data || []).map(course => ({
            ...course,
            level: course.level as 'beginner' | 'intermediate' | 'advanced'
          }))
          
          logger.info('Cursos de academia obtenidos', { 
            count: courses.length, 
            categoryId: categoryId || 'todas' 
          })
          
          return courses
        } catch (err) {
          logger.error('Error en queryFn de cursos', err)
          throw err
        }
      },
      enabled: !!user?.org_id && (options.enabled ?? true),
      staleTime: options.staleTime ?? 1000 * 60 * 10, // 10 minutos por defecto
      retry: (failureCount, error) => {
        if (failureCount >= 3) {
          logger.error('Máximo número de reintentos alcanzado para cursos', { failureCount, error })
          return false
        }
        return true
      }
    })
  }

  /**
   * Obtiene el progreso del usuario en los cursos de academia
   * @returns {Object} Query para progreso del usuario
   */
  const useUserProgress = () => {
    return useQuery({
      queryKey: ['academy-user-progress', user?.org_id, user?.id],
      queryFn: async (): Promise<UserProgress[]> => {
        try {
          if (!user?.org_id || !user?.id) {
            logger.warn('org_id o user_id no encontrado para obtener progreso')
            throw new Error('User not found')
          }

          logger.info('Obteniendo progreso de usuario en academia', { 
            orgId: user.org_id, 
            userId: user.id 
          })

          const { data, error } = await supabase
            .from('academy_user_progress')
            .select('*')
            .eq('org_id', user.org_id)
            .eq('user_id', user.id)

          if (error) {
            logger.error('Error al obtener progreso de usuario', error)
            throw error
          }
          
          // Transform data to match our types
          const progress = (data || []).map(progress => ({
            ...progress,
            status: progress.status as 'not_started' | 'in_progress' | 'completed'
          }))
          
          logger.info('Progreso de usuario obtenido', { count: progress.length })
          
          return progress
        } catch (err) {
          logger.error('Error en queryFn de progreso', err)
          throw err
        }
      },
      enabled: !!user?.org_id && !!user?.id && (options.enabled ?? true),
      staleTime: options.staleTime ?? 1000 * 60 * 5, // 5 minutos por defecto (más dinámico)
      retry: (failureCount, error) => {
        if (failureCount >= 3) {
          logger.error('Máximo número de reintentos alcanzado para progreso', { failureCount, error })
          return false
        }
        return true
      }
    })
  }

  return {
    usePublishedCategories,
    usePublishedCourses,
    useUserProgress
  }
}
