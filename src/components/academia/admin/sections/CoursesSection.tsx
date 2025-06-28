
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CoursesTable } from '../CoursesTable'
import type { AcademyCourse } from '@/types/academy'

interface CoursesSectionProps {
  courses: AcademyCourse[]
  onEdit: (course: AcademyCourse) => void
  onDelete: (courseId: string) => void
  onViewLessons: (courseId: string) => void
  onAddLesson: (courseId: string) => void
  isLoading?: boolean
}

export function CoursesSection({
  courses,
  onEdit,
  onDelete,
  onViewLessons,
  onAddLesson,
  isLoading = false
}: CoursesSectionProps) {
  if (isLoading) {
    return (
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle>Gestión de Cursos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0.5 border-black rounded-[10px]">
      <CardHeader>
        <CardTitle>Gestión de Cursos</CardTitle>
      </CardHeader>
      <CardContent>
        {courses && courses.length > 0 ? (
          <CoursesTable
            courses={courses}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewLessons={onViewLessons}
            onAddLesson={onAddLesson}
          />
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No hay cursos creados</h3>
            <p className="text-gray-600 mb-4">
              Comienza creando tu primer curso para la academia
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
