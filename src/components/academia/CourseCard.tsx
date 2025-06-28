
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Clock, ChevronRight } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  level: string
  total_lessons: number
  estimated_duration?: number
  academy_categories?: {
    name: string
  }
}

interface UserProgress {
  course_id: string
  progress_percentage: number
}

interface CourseCardProps {
  course: Course
  userProgress?: UserProgress
  onCourseSelect: (courseId: string) => void
}

export function CourseCard({ course, userProgress, onCourseSelect }: CourseCardProps) {
  const progressPercentage = userProgress?.progress_percentage || 0

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Principiante'
      case 'intermediate': return 'Intermedio'
      case 'advanced': return 'Avanzado'
      default: return 'Sin definir'
    }
  }

  return (
    <Card 
      className="border-0.5 border-black rounded-[10px] hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
      onClick={() => onCourseSelect(course.id)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="text-3xl">📚</div>
          <Badge className={getLevelColor(course.level)}>
            {getLevelText(course.level)}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
        <p className="text-sm text-gray-600 line-clamp-3">{course.description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {course.total_lessons} lecciones
            </div>
            {course.estimated_duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {course.estimated_duration} min
              </div>
            )}
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progreso</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {course.academy_categories?.name || 'Sin categoría'}
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
