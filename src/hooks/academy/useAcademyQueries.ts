
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import type { AcademyCategory, AcademyCourse, UserProgress } from '@/types/academy'

export const useAcademyQueries = () => {
  const { user } = useApp()

  // Obtener solo categorías activas y publicadas
  const usePublishedCategories = () => {
    return useQuery({
      queryKey: ['academy-categories', user?.org_id],
      queryFn: async (): Promise<AcademyCategory[]> => {
        if (!user?.org_id) throw new Error('No organization found')

        const { data, error } = await supabase
          .from('academy_categories')
          .select('*')
          .eq('org_id', user.org_id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (error) throw error
        return data || []
      },
      enabled: !!user?.org_id
    })
  }

  // Obtener solo cursos publicados
  const usePublishedCourses = (categoryId?: string) => {
    return useQuery({
      queryKey: ['academy-courses', user?.org_id, categoryId],
      queryFn: async (): Promise<AcademyCourse[]> => {
        if (!user?.org_id) throw new Error('No organization found')

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

        if (error) throw error
        return data || []
      },
      enabled: !!user?.org_id
    })
  }

  // Obtener progreso del usuario
  const useUserProgress = () => {
    return useQuery({
      queryKey: ['academy-user-progress', user?.org_id, user?.id],
      queryFn: async (): Promise<UserProgress[]> => {
        if (!user?.org_id || !user?.id) throw new Error('User not found')

        const { data, error } = await supabase
          .from('academy_user_progress')
          .select('*')
          .eq('org_id', user.org_id)
          .eq('user_id', user.id)

        if (error) throw error
        return data || []
      },
      enabled: !!user?.org_id && !!user?.id
    })
  }

  return {
    usePublishedCategories,
    usePublishedCourses,
    useUserProgress
  }
}
