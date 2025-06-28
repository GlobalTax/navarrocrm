
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export const useAcademyCategories = () => {
  return useQuery({
    queryKey: ['academy-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academy_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error
      return data
    }
  })
}

export const useAcademyCourses = (categoryId?: string) => {
  return useQuery({
    queryKey: ['academy-courses', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('academy_courses')
        .select(`
          *,
          academy_categories(*)
        `)
        .eq('is_published', true)
        .order('sort_order')

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

export const useAcademyLessons = (courseId: string) => {
  return useQuery({
    queryKey: ['academy-lessons', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academy_lessons')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('sort_order')

      if (error) throw error
      return data
    },
    enabled: !!courseId
  })
}

export const useUserProgress = (courseId?: string) => {
  return useQuery({
    queryKey: ['user-progress', courseId],
    queryFn: async () => {
      let query = supabase
        .from('academy_user_progress')
        .select('*')

      if (courseId) {
        query = query.eq('course_id', courseId)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

export const useUpdateProgress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      courseId,
      lessonId,
      status,
      progressPercentage,
      timeSpent
    }: {
      courseId: string
      lessonId?: string
      status: 'not_started' | 'in_progress' | 'completed'
      progressPercentage: number
      timeSpent?: number
    }) => {
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Obtener el org_id del usuario
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

      if (userError) throw new Error('Error obteniendo datos del usuario')
      if (!userData?.org_id) throw new Error('Usuario sin organización')

      const { data, error } = await supabase
        .from('academy_user_progress')
        .upsert({
          user_id: user.id,
          org_id: userData.org_id,
          course_id: courseId,
          lesson_id: lessonId,
          status,
          progress_percentage: progressPercentage,
          time_spent: timeSpent || 0,
          last_accessed_at: new Date().toISOString(),
          ...(status === 'completed' && { completed_at: new Date().toISOString() })
        })
        .select()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress'] })
      toast.success('Progreso actualizado')
    },
    onError: (error) => {
      console.error('Error updating progress:', error)
      toast.error('Error al actualizar el progreso')
    }
  })
}
