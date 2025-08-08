
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Clock, Play } from 'lucide-react'
import type { AcademyCourse, UserProgress } from '@/types/academy'

interface CourseDetailProps {
  course: AcademyCourse
  userProgress?: UserProgress
  onBack: () => void
}

export function CourseDetail({ course, userProgress, onBack }: CourseDetailProps) {
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
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          size="sm"
          className="crm-button-text"
        >
          ← Volver a cursos
        </Button>
        <div className="crm-caption">
          {course.academy_categories?.name} / {course.title}
        </div>
      </div>

      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📚</div>
              <div>
                <CardTitle className="crm-section-title mb-2">{course.title}</CardTitle>
                <p className="crm-section-subtitle mb-4">{course.description || 'Sin descripción'}</p>
                <div className="flex items-center gap-4 crm-table-cell-secondary">
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
                  <Badge className={`${getLevelColor(course.level)} crm-badge-text`}>
                    {getLevelText(course.level)}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="crm-widget-label mb-1">Progreso</div>
              <div className="crm-metric-secondary mb-2">{progressPercentage}%</div>
              <Progress value={progressPercentage} className="w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-8 flex gap-4">
            <Button size="lg" className="bg-black hover:bg-gray-800 crm-button-text-lg">
              <Play className="h-5 w-5 mr-2" />
              Comenzar Curso
            </Button>
            <Button variant="outline" size="lg" className="crm-button-text-lg">
              <BookOpen className="h-5 w-5 mr-2" />
              Ver Lecciones
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
