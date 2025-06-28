
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

// Categories mutations
export const useAcademyCategoriesMutation = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const createCategory = useMutation({
    mutationFn: async (data: {
      name: string
      description?: string
      icon?: string
      color: string
      sort_order?: number
      is_active: boolean
    }) => {
      if (!user?.org_id) throw new Error('No organization found')

      const { data: category, error } = await supabase
        .from('academy_categories')
        .insert({
          ...data,
          org_id: user.org_id
        })
        .select()
        .single()

      if (error) throw error
      return category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-categories'] })
      toast.success('Categoría creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating category:', error)
      toast.error('Error al crear la categoría')
    }
  })

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string
      name: string
      description?: string
      icon?: string
      color: string
      sort_order?: number
      is_active: boolean
    }) => {
      const { data: category, error } = await supabase
        .from('academy_categories')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-categories'] })
      toast.success('Categoría actualizada exitosamente')
    },
    onError: (error) => {
      console.error('Error updating category:', error)
      toast.error('Error al actualizar la categoría')
    }
  })

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('academy_categories')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-categories'] })
      toast.success('Categoría eliminada exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting category:', error)
      toast.error('Error al eliminar la categoría')
    }
  })

  return { createCategory, updateCategory, deleteCategory }
}

// Courses mutations
export const useAcademyCoursesMutation = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const createCourse = useMutation({
    mutationFn: async (data: {
      title: string
      description?: string
      category_id: string
      level: 'beginner' | 'intermediate' | 'advanced'
      estimated_duration?: number
      is_published: boolean
    }) => {
      if (!user?.org_id) throw new Error('No organization found')

      const { data: course, error } = await supabase
        .from('academy_courses')
        .insert({
          ...data,
          org_id: user.org_id,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error
      return course
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-courses'] })
      toast.success('Curso creado exitosamente')
    },
    onError: (error) => {
      console.error('Error creating course:', error)
      toast.error('Error al crear el curso')
    }
  })

  const updateCourse = useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string
      title: string
      description?: string
      category_id: string
      level: 'beginner' | 'intermediate' | 'advanced'
      estimated_duration?: number
      is_published: boolean
    }) => {
      const { data: course, error } = await supabase
        .from('academy_courses')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return course
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-courses'] })
      toast.success('Curso actualizado exitosamente')
    },
    onError: (error) => {
      console.error('Error updating course:', error)
      toast.error('Error al actualizar el curso')
    }
  })

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('academy_courses')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-courses'] })
      toast.success('Curso eliminado exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting course:', error)
      toast.error('Error al eliminar el curso')
    }
  })

  return { createCourse, updateCourse, deleteCourse }
}

// Lessons mutations
export const useAcademyLessonsMutation = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const createLesson = useMutation({
    mutationFn: async (data: {
      course_id: string
      title: string
      content: string
      lesson_type: 'text' | 'interactive' | 'quiz'
      estimated_duration?: number
      sort_order?: number
      is_published: boolean
      learning_objectives?: string[]
      prerequisites?: string[]
    }) => {
      if (!user?.org_id) throw new Error('No organization found')

      const { data: lesson, error } = await supabase
        .from('academy_lessons')
        .insert({
          ...data,
          org_id: user.org_id
        })
        .select()
        .single()

      if (error) throw error

      // Update total_lessons count in course
      await supabase.rpc('increment_course_lessons', { 
        course_id: data.course_id 
      })

      return lesson
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['academy-lessons', variables.course_id] })
      queryClient.invalidateQueries({ queryKey: ['academy-courses'] })
      toast.success('Lección creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating lesson:', error)
      toast.error('Error al crear la lección')
    }
  })

  const updateLesson = useMutation({
    mutationFn: async ({ id, course_id, ...data }: {
      id: string
      course_id: string
      title: string
      content: string
      lesson_type: 'text' | 'interactive' | 'quiz'
      estimated_duration?: number
      sort_order?: number
      is_published: boolean
      learning_objectives?: string[]
      prerequisites?: string[]
    }) => {
      const { data: lesson, error } = await supabase
        .from('academy_lessons')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return lesson
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['academy-lessons', variables.course_id] })
      toast.success('Lección actualizada exitosamente')
    },
    onError: (error) => {
      console.error('Error updating lesson:', error)
      toast.error('Error al actualizar la lección')
    }
  })

  const deleteLesson = useMutation({
    mutationFn: async ({ id, course_id }: { id: string, course_id: string }) => {
      const { error } = await supabase
        .from('academy_lessons')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Update total_lessons count in course
      await supabase.rpc('decrement_course_lessons', { 
        course_id 
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['academy-lessons', variables.course_id] })
      queryClient.invalidateQueries({ queryKey: ['academy-courses'] })
      toast.success('Lección eliminada exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting lesson:', error)
      toast.error('Error al eliminar la lección')
    }
  })

  return { createLesson, updateLesson, deleteLesson }
}
