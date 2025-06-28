
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

// Interfaces temporales hasta que Supabase actualice los tipos
export interface AcademyCategory {
  id: string
  org_id: string
  name: string
  description?: string
  icon?: string
  color: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AcademyCourse {
  id: string
  org_id: string
  category_id: string
  title: string
  description?: string
  level: 'beginner' | 'intermediate' | 'advanced'
  estimated_duration?: number
  total_lessons: number
  sort_order: number
  is_published: boolean
  created_by: string
  created_at: string
  updated_at: string
  academy_categories?: AcademyCategory
}

export interface AcademyLesson {
  id: string
  org_id: string
  course_id: string
  title: string
  content: string
  lesson_type: 'text' | 'interactive' | 'quiz'
  estimated_duration?: number
  sort_order: number
  is_published: boolean
  prerequisites: string[]
  learning_objectives: string[]
  practical_exercises: any[]
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  org_id: string
  user_id: string
  course_id: string
  lesson_id?: string
  status: 'not_started' | 'in_progress' | 'completed'
  progress_percentage: number
  time_spent: number
  completed_at?: string
  last_accessed_at: string
  notes?: string
  created_at: string
  updated_at: string
}

export const useAcademyCategories = () => {
  return useQuery({
    queryKey: ['academy-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academy_categories' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error
      return (data as unknown) as AcademyCategory[]
    }
  })
}

export const useAcademyCourses = (categoryId?: string) => {
  return useQuery({
    queryKey: ['academy-courses', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('academy_courses' as any)
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
      return (data as unknown) as AcademyCourse[]
    }
  })
}

export const useAcademyLessons = (courseId: string) => {
  return useQuery({
    queryKey: ['academy-lessons', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academy_lessons' as any)
        .select('*')
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('sort_order')

      if (error) throw error
      return (data as unknown) as AcademyLesson[]
    },
    enabled: !!courseId
  })
}

export const useUserProgress = (courseId?: string) => {
  return useQuery({
    queryKey: ['user-progress', courseId],
    queryFn: async () => {
      let query = supabase
        .from('academy_user_progress' as any)
        .select('*')

      if (courseId) {
        query = query.eq('course_id', courseId)
      }

      const { data, error } = await query
      if (error) throw error
      return (data as unknown) as UserProgress[]
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
      const { data, error } = await supabase
        .from('academy_user_progress' as any)
        .upsert({
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
