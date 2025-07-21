
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { createLogger } from '@/utils/logger'
import { useMemo } from 'react'
import type { AcademyCategory, AcademyCourse } from '@/types/academy'

/**
 * Opciones de configuración para useAcademyAdminQueries
 * @interface UseAcademyAdminQueriesOptions
 */
export interface UseAcademyAdminQueriesOptions {
  /** Habilitar consultas */
  enabled?: boolean
  /** Tiempo de cache en milisegundos */
  staleTime?: number
  /** Incluir estadísticas en el resultado */
  includeStats?: boolean
}

/**
 * Hook para consultas administrativas de Academy
 * Proporciona funcionalidades avanzadas para gestión de categorías, cursos y estadísticas
 * 
 * @param {UseAcademyAdminQueriesOptions} options - Opciones de configuración
 * @returns Objeto con hooks de consulta para administración
 * 
 * @example
 * ```tsx
 * const { useAllCategories, useAllCourses, useAdminStats } = useAcademyAdminQueries({
 *   staleTime: 300000,
 *   includeStats: true
 * })
 * 
 * const { data: categories, isLoading } = useAllCategories()
 * const { data: stats } = useAdminStats()
 * ```
 * 
 * @throws {Error} Cuando no se puede acceder a los datos de la organización
 */
export const useAcademyAdminQueries = (options: UseAcademyAdminQueriesOptions = {}) => {
  const logger = createLogger('useAcademyAdminQueries')
  const { user } = useApp()

  // Validación y configuración de opciones
  const validatedOptions = useMemo(() => {
    const defaults: Required<UseAcademyAdminQueriesOptions> = {
      enabled: true,
      staleTime: 1000 * 60 * 5, // 5 minutos
      includeStats: true
    }

    // Validar staleTime
    if (options.staleTime && (options.staleTime < 0 || options.staleTime > 1000 * 60 * 60)) {
      logger.warn('staleTime fuera de rango recomendado (0-3600000ms)', { staleTime: options.staleTime })
    }

    return { ...defaults, ...options }
  }, [options, logger])

  // Validación de contexto
  if (!user) {
    logger.error('Usuario no encontrado en el contexto')
    throw new Error('Usuario no autenticado')
  }

  if (!user.org_id) {
    logger.warn('org_id no encontrado para el usuario', { userId: user.id })
  }

  /**
   * Hook para obtener todas las categorías de la academia (incluyendo inactivas)
   * @returns Query con categorías completas para administración
   */
  const useAllCategories = () => {
    return useQuery({
      queryKey: ['academy-admin-categories', user?.org_id, validatedOptions.staleTime],
      queryFn: async (): Promise<AcademyCategory[]> => {
        try {
          if (!user?.org_id) {
            logger.error('org_id no disponible para consulta de categorías')
            throw new Error('No organization found')
          }

          logger.info('Obteniendo categorías de academia (admin)', { orgId: user.org_id })

          const { data, error } = await supabase
            .from('academy_categories')
            .select('*')
            .eq('org_id', user.org_id)
            .order('sort_order', { ascending: true })

          if (error) {
            logger.error('Error al obtener categorías de academia', error)
            throw error
          }

          const categories = data || []
          logger.info('Categorías de academia obtenidas exitosamente', { count: categories.length })
          
          return categories
        } catch (err) {
          logger.error('Error en queryFn de categorías de academia', err)
          throw err
        }
      },
      enabled: !!user?.org_id && validatedOptions.enabled,
      staleTime: validatedOptions.staleTime,
      retry: (failureCount, error) => {
        if (failureCount >= 3) {
          logger.error('Máximo número de reintentos alcanzado para categorías', { failureCount, error })
          return false
        }
        return true
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    })
  }

  /**
   * Hook para obtener todos los cursos (incluyendo borradores para admin)
   * @returns Query con cursos completos e información de categorías
   */
  const useAllCourses = () => {
    return useQuery({
      queryKey: ['academy-admin-courses', user?.org_id, validatedOptions.staleTime],
      queryFn: async (): Promise<AcademyCourse[]> => {
        try {
          if (!user?.org_id) {
            logger.error('org_id no disponible para consulta de cursos')
            throw new Error('No organization found')
          }

          logger.info('Obteniendo cursos de academia (admin)', { orgId: user.org_id })

          const { data, error } = await supabase
            .from('academy_courses')
            .select(`
              *,
              academy_categories (
                name,
                color
              )
            `)
            .eq('org_id', user.org_id)
            .order('created_at', { ascending: false })

          if (error) {
            logger.error('Error al obtener cursos de academia', error)
            throw error
          }
          
          // Transform data to match our types
          const courses = (data || []).map(course => ({
            ...course,
            level: course.level as 'beginner' | 'intermediate' | 'advanced'
          }))

          logger.info('Cursos de academia obtenidos exitosamente', { count: courses.length })
          
          return courses
        } catch (err) {
          logger.error('Error en queryFn de cursos de academia', err)
          throw err
        }
      },
      enabled: !!user?.org_id && validatedOptions.enabled,
      staleTime: validatedOptions.staleTime,
      retry: (failureCount, error) => {
        if (failureCount >= 3) {
          logger.error('Máximo número de reintentos alcanzado para cursos', { failureCount, error })
          return false
        }
        return true
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    })
  }

  /**
   * Hook para obtener estadísticas administrativas de la academia
   * @returns Query con métricas completas de categorías, cursos y lecciones
   */
  const useAdminStats = () => {
    return useQuery({
      queryKey: ['academy-admin-stats', user?.org_id, validatedOptions.staleTime],
      queryFn: async () => {
        try {
          if (!user?.org_id) {
            logger.error('org_id no disponible para consulta de estadísticas')
            throw new Error('No organization found')
          }

          logger.info('Obteniendo estadísticas de academia (admin)', { orgId: user.org_id })

          const [categoriesResult, coursesResult, lessonsResult] = await Promise.all([
            supabase
              .from('academy_categories')
              .select('id, is_active')
              .eq('org_id', user.org_id),
            supabase
              .from('academy_courses')
              .select('id, is_published')
              .eq('org_id', user.org_id),
            supabase
              .from('academy_lessons')
              .select('id, is_published')
              .eq('org_id', user.org_id)
          ])

          if (categoriesResult.error) {
            logger.error('Error al obtener categorías para estadísticas', categoriesResult.error)
            throw categoriesResult.error
          }

          if (coursesResult.error) {
            logger.error('Error al obtener cursos para estadísticas', coursesResult.error)
            throw coursesResult.error
          }

          if (lessonsResult.error) {
            logger.error('Error al obtener lecciones para estadísticas', lessonsResult.error)
            throw lessonsResult.error
          }

          const categories = categoriesResult.data || []
          const courses = coursesResult.data || []
          const lessons = lessonsResult.data || []

          const stats = {
            totalCategories: categories.length,
            activeCategories: categories.filter(c => c.is_active).length,
            totalCourses: courses.length,
            publishedCourses: courses.filter(c => c.is_published).length,
            totalLessons: lessons.length,
            publishedLessons: lessons.filter(l => l.is_published).length
          }

          logger.info('Estadísticas de academia obtenidas exitosamente', stats)
          
          return stats
        } catch (err) {
          logger.error('Error en queryFn de estadísticas de academia', err)
          throw err
        }
      },
      enabled: !!user?.org_id && validatedOptions.enabled && validatedOptions.includeStats,
      staleTime: validatedOptions.staleTime,
      retry: (failureCount, error) => {
        if (failureCount >= 3) {
          logger.error('Máximo número de reintentos alcanzado para estadísticas', { failureCount, error })
          return false
        }
        return true
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    })
  }

  return {
    useAllCategories,
    useAllCourses,
    useAdminStats
  }
}
