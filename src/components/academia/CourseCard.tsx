
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Clock, ChevronRight } from 'lucide-react'
import type { AcademyCourse, UserProgress } from '@/types/academy'

interface CourseCardProps {
  course: AcademyCourse
  userProgress?: UserProgress
  onCourseSelect: (courseId: string) => void
}

export function CourseCard({ course, userProgress, onCourseSelect }: CourseCardProps) {
  const progressPercentage = userProgress?.progress_percentage || 0

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-academia-beginner-soft text-academia-beginner border-academia-beginner/20'
      case 'intermediate': return 'bg-academia-intermediate-soft text-academia-intermediate border-academia-intermediate/20'
      case 'advanced': return 'bg-academia-advanced-soft text-academia-advanced border-academia-advanced/20'
      default: return 'bg-muted text-muted-foreground border-muted'
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
          <Badge className={`${getLevelColor(course.level)} crm-badge-text`}>
            {getLevelText(course.level)}
          </Badge>
        </div>
        <CardTitle className="crm-card-title line-clamp-2">{course.title}</CardTitle>
        <p className="crm-card-subtitle line-clamp-3">{course.description || 'Sin descripción'}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between crm-table-cell-secondary">
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
            <div className="flex justify-between crm-table-cell mb-2">
              <span>Progreso</span>
              <span className="font-semibold">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            <div className="crm-caption">
              {course.academy_categories?.name || 'Sin categoría'}
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
