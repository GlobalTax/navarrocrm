
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { useAcademyCoursesMutation, useAcademyLessonsMutation } from '@/hooks/useAcademyAdmin'

export interface CourseGenerationRequest {
  topic: string
  level: 'beginner' | 'intermediate' | 'advanced'
  category_id: string
  estimated_lessons: number
  target_audience: string
}

export interface GeneratedCourse {
  title: string
  description: string
  lessons: Array<{
    title: string
    content: string
    lesson_type: 'text' | 'interactive' | 'quiz'
    estimated_duration: number
    learning_objectives: string[]
    prerequisites: string[]
  }>
}

export const useAICourseGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const { user } = useApp()
  const { createCourse } = useAcademyCoursesMutation()
  const { createLesson } = useAcademyLessonsMutation()

  const generateCourse = async (request: CourseGenerationRequest): Promise<string | null> => {
    if (!user?.org_id) {
      toast.error('No se pudo obtener la organización')
      return null
    }

    setIsGenerating(true)
    try {
      // Llamar a la función edge para generar el curso
      const { data: generatedData, error } = await supabase.functions.invoke('generate-academy-course', {
        body: {
          ...request,
          orgId: user.org_id,
          crmContext: {
            hasClients: true,
            hasCases: true,
            hasTimeTracking: true,
            hasProposals: true,
            hasCalendar: true,
            hasDocuments: true,
            hasUsers: true,
            hasReports: true
          }
        }
      })

      if (error) {
        console.error('Error generating course:', error)
        toast.error('Error al generar el curso con IA')
        return null
      }

      const courseData: GeneratedCourse = generatedData

      // Crear el curso en la base de datos
      const course = await createCourse.mutateAsync({
        title: courseData.title,
        description: courseData.description,
        category_id: request.category_id,
        level: request.level,
        estimated_duration: courseData.lessons.reduce((total, lesson) => total + lesson.estimated_duration, 0),
        is_published: false // Lo dejamos como borrador para que se pueda revisar
      })

      // Crear las lecciones
      for (let i = 0; i < courseData.lessons.length; i++) {
        const lesson = courseData.lessons[i]
        await createLesson.mutateAsync({
          course_id: course.id,
          title: lesson.title,
          content: lesson.content,
          lesson_type: lesson.lesson_type,
          estimated_duration: lesson.estimated_duration,
          sort_order: i + 1,
          is_published: false,
          learning_objectives: lesson.learning_objectives,
          prerequisites: lesson.prerequisites
        })
      }

      toast.success(`Curso "${courseData.title}" generado exitosamente con ${courseData.lessons.length} lecciones`)
      console.log('Generated course:', course)
      
      return course.id

    } catch (error) {
      console.error('Error in course generation:', error)
      toast.error('Error al generar el curso')
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generateCourse,
    isGenerating
  }
}
