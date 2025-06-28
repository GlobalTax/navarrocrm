
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import type { AcademyCategory, AcademyCourse } from '@/types/academy'

export const useAcademyAdminQueries = () => {
  const { user } = useApp()

  // Obtener TODAS las categorías (incluyendo inactivas para admin)
  const useAllCategories = () => {
    return useQuery({
      queryKey: ['academy-admin-categories', user?.org_id],
      queryFn: async (): Promise<AcademyCategory[]> => {
        if (!user?.org_id) throw new Error('No organization found')

        const { data, error } = await supabase
          .from('academy_categories')
          .select('*')
          .eq('org_id', user.org_id)
          .order('sort_order', { ascending: true })

        if (error) throw error
        return data || []
      },
      enabled: !!user?.org_id
    })
  }

  // Obtener TODOS los cursos (incluyendo borradores para admin)
  const useAllCourses = () => {
    return useQuery({
      queryKey: ['academy-admin-courses', user?.org_id],
      queryFn: async (): Promise<AcademyCourse[]> => {
        if (!user?.org_id) throw new Error('No organization found')

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

        if (error) throw error
        return data || []
      },
      enabled: !!user?.org_id
    })
  }

  // Obtener estadísticas para admin
  const useAdminStats = () => {
    return useQuery({
      queryKey: ['academy-admin-stats', user?.org_id],
      queryFn: async () => {
        if (!user?.org_id) throw new Error('No organization found')

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

        const categories = categoriesResult.data || []
        const courses = coursesResult.data || []
        const lessons = lessonsResult.data || []

        return {
          totalCategories: categories.length,
          activeCategories: categories.filter(c => c.is_active).length,
          totalCourses: courses.length,
          publishedCourses: courses.filter(c => c.is_published).length,
          totalLessons: lessons.length,
          publishedLessons: lessons.filter(l => l.is_published).length
        }
      },
      enabled: !!user?.org_id
    })
  }

  return {
    useAllCategories,
    useAllCourses,
    useAdminStats
  }
}
