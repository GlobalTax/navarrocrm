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

      console.log('🏗️ Creating category:', data)

      const { data: category, error } = await supabase
        .from('academy_categories')
        .insert({
          ...data,
          org_id: user.org_id
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating category:', error)
        throw error
      }
      
      console.log('✅ Category created successfully:', category)
      return category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-categories'] })
      toast.success('Categoría creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating category:', error)
      toast.error('Error al crear la categoría: ' + error.message)
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
      console.log('🚀 Starting course creation with user:', user)
      
      if (!user?.org_id) {
        console.error('❌ No organization found for user:', user)
        throw new Error('No se encontró la organización del usuario')
      }

      if (!user?.id) {
        console.error('❌ No user ID found:', user)
        throw new Error('No se encontró el ID del usuario')
      }

      // Validar que la categoría existe
      const { data: categoryExists } = await supabase
        .from('academy_categories')
        .select('id')
        .eq('id', data.category_id)
        .eq('org_id', user.org_id)
        .single()

      if (!categoryExists) {
        throw new Error('La categoría seleccionada no existe o no pertenece a tu organización')
      }

      const courseData = {
        ...data,
        org_id: user.org_id,
        created_by: user.id
      }

      console.log('🏗️ Creating course with data:', courseData)

      const { data: course, error } = await supabase
        .from('academy_courses')
        .insert(courseData)
        .select(`
          *,
          academy_categories (
            name,
            color
          )
        `)
        .single()

      if (error) {
        console.error('❌ Supabase error creating course:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw new Error(`Error de base de datos: ${error.message}`)
      }

      if (!course) {
        console.error('❌ No course returned from database')
        throw new Error('No se pudo crear el curso - sin respuesta de la base de datos')
      }

      console.log('✅ Course created successfully:', course)
      return course
    },
    onSuccess: (course) => {
      console.log('🎉 Course creation success callback executed for:', course.title)
      queryClient.invalidateQueries({ queryKey: ['academy-courses'] })
      queryClient.invalidateQueries({ queryKey: ['academy-categories'] })
      toast.success(`Curso "${course.title}" creado exitosamente`)
    },
    onError: (error) => {
      console.error('❌ Error in createCourse mutation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error(`Error al crear el curso: ${errorMessage}`)
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
      console.log('📝 Updating course:', id, data)

      const { data: course, error } = await supabase
        .from('academy_courses')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating course:', error)
        throw error
      }

      console.log('✅ Course updated successfully:', course)
      return course
    },
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ['academy-courses'] })
      toast.success(`Curso "${course.title}" actualizado exitosamente`)
    },
    onError: (error) => {
      console.error('Error updating course:', error)
      toast.error('Error al actualizar el curso: ' + error.message)
    }
  })

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Deleting course:', id)

      const { error } = await supabase
        .from('academy_courses')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Error deleting course:', error)
        throw error
      }

      console.log('✅ Course deleted successfully')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-courses'] })
      toast.success('Curso eliminado exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting course:', error)
      toast.error('Error al eliminar el curso: ' + error.message)
    }
  })

  return { createCourse, updateCourse, deleteCourse }
}

// Helper function to update course lesson count
const updateCourseLessonCount = async (courseId: string, increment: boolean = true) => {
  // Get current course data
  const { data: course, error: fetchError } = await supabase
    .from('academy_courses')
    .select('total_lessons')
    .eq('id', courseId)
    .single()

  if (fetchError) {
    console.error('Error fetching course:', fetchError)
    return
  }

  // Update the count
  const newCount = increment 
    ? (course.total_lessons || 0) + 1 
    : Math.max((course.total_lessons || 0) - 1, 0)

  const { error: updateError } = await supabase
    .from('academy_courses')
    .update({ 
      total_lessons: newCount,
      updated_at: new Date().toISOString()
    })
    .eq('id', courseId)

  if (updateError) {
    console.error('Error updating course lesson count:', updateError)
  }
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
      await updateCourseLessonCount(data.course_id, true)

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
      await updateCourseLessonCount(course_id, false)
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
