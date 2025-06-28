
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

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
