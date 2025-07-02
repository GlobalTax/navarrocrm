
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { CourseFormData, CategoryFormData, LessonFormData } from '@/types/academy'

export const useAcademyMutations = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  // Mutaciones de Categorías
  const createCategory = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      if (!user?.org_id) throw new Error('No organization found')

      const { data: category, error } = await supabase
        .from('academy_categories')
        .insert({ ...data, org_id: user.org_id })
        .select()
        .maybeSingle()

      if (error) throw error
      return category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-categories'] })
      queryClient.invalidateQueries({ queryKey: ['academy-admin-categories'] })
      toast.success('Categoría creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating category:', error)
      toast.error('Error al crear la categoría')
    }
  })

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...data }: CategoryFormData & { id: string }) => {
      const { data: category, error } = await supabase
        .from('academy_categories')
        .update(data)
        .eq('id', id)
        .select()
        .maybeSingle()

      if (error) throw error
      return category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-categories'] })
      queryClient.invalidateQueries({ queryKey: ['academy-admin-categories'] })
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
      queryClient.invalidateQueries({ queryKey: ['academy-admin-categories'] })
      toast.success('Categoría eliminada exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting category:', error)
      toast.error('Error al eliminar la categoría')
    }
  })

  // Mutaciones de Cursos
  const createCourse = useMutation({
    mutationFn: async (data: CourseFormData) => {
      if (!user?.org_id || !user?.id) throw new Error('No organization or user found')

      const { data: course, error } = await supabase
        .from('academy_courses')
        .insert({
          ...data,
          org_id: user.org_id,
          created_by: user.id
        })
        .select(`
          *,
          academy_categories (
            name,
            color
          )
        `)
        .maybeSingle()

      if (error) throw error
      return course
    },
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ['academy-courses'] })
      queryClient.invalidateQueries({ queryKey: ['academy-admin-courses'] })
      toast.success(`Curso "${course.title}" creado exitosamente`)
    },
    onError: (error) => {
      console.error('Error creating course:', error)
      toast.error('Error al crear el curso')
    }
  })

  const updateCourse = useMutation({
    mutationFn: async ({ id, ...data }: CourseFormData & { id: string }) => {
      const { data: course, error } = await supabase
        .from('academy_courses')
        .update(data)
        .eq('id', id)
        .select()
        .maybeSingle()

      if (error) throw error
      return course
    },
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ['academy-courses'] })
      queryClient.invalidateQueries({ queryKey: ['academy-admin-courses'] })
      toast.success(`Curso "${course.title}" actualizado exitosamente`)
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
      queryClient.invalidateQueries({ queryKey: ['academy-admin-courses'] })
      toast.success('Curso eliminado exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting course:', error)
      toast.error('Error al eliminar el curso')
    }
  })

  // Mutaciones de Lecciones
  const createLesson = useMutation({
    mutationFn: async (data: LessonFormData & { course_id: string }) => {
      if (!user?.org_id) throw new Error('No organization found')

      const { data: lesson, error } = await supabase
        .from('academy_lessons')
        .insert({
          ...data,
          org_id: user.org_id
        })
        .select()
        .maybeSingle()

      if (error) throw error

      // Actualizar el contador de lecciones del curso
      const { data: course } = await supabase
        .from('academy_courses')
        .select('total_lessons')
        .eq('id', data.course_id)
        .maybeSingle()

      if (course) {
        await supabase
          .from('academy_courses')
          .update({ 
            total_lessons: (course.total_lessons || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.course_id)
      }

      return lesson
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['academy-lessons', variables.course_id] })
      queryClient.invalidateQueries({ queryKey: ['academy-courses'] })
      queryClient.invalidateQueries({ queryKey: ['academy-admin-courses'] })
      toast.success('Lección creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating lesson:', error)
      toast.error('Error al crear la lección')
    }
  })

  const updateLesson = useMutation({
    mutationFn: async ({ id, course_id, ...data }: LessonFormData & { id: string, course_id: string }) => {
      const { data: lesson, error } = await supabase
        .from('academy_lessons')
        .update(data)
        .eq('id', id)
        .select()
        .maybeSingle()

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

      // Actualizar el contador de lecciones del curso
      const { data: course } = await supabase
        .from('academy_courses')
        .select('total_lessons')
        .eq('id', course_id)
        .maybeSingle()

      if (course) {
        await supabase
          .from('academy_courses')
          .update({ 
            total_lessons: Math.max((course.total_lessons || 0) - 1, 0),
            updated_at: new Date().toISOString()
          })
          .eq('id', course_id)
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['academy-lessons', variables.course_id] })
      queryClient.invalidateQueries({ queryKey: ['academy-courses'] })
      queryClient.invalidateQueries({ queryKey: ['academy-admin-courses'] })
      toast.success('Lección eliminada exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting lesson:', error)
      toast.error('Error al eliminar la lección')
    }
  })

  return {
    // Categorías
    createCategory,
    updateCategory,
    deleteCategory,
    // Cursos
    createCourse,
    updateCourse,
    deleteCourse,
    // Lecciones
    createLesson,
    updateLesson,
    deleteLesson
  }
}
