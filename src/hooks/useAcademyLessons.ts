
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

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
