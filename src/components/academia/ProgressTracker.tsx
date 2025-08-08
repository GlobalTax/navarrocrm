import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { PlayCircle, CheckCircle, Clock, Trophy } from 'lucide-react'
import { useAcademyMutations } from '@/hooks/academy/useAcademyMutations'
import { useAcademyRealtime } from '@/hooks/academy/useAcademyRealtime'
import type { AcademyCourse, UserProgress } from '@/types/academy'

interface ProgressTrackerProps {
  course: AcademyCourse
  userProgress?: UserProgress
  onProgressUpdate?: () => void
}

export function ProgressTracker({ course, userProgress, onProgressUpdate }: ProgressTrackerProps) {
  const [timeSpent, setTimeSpent] = useState<number>(0)
  const { updateUserProgress, markLessonCompleted } = useAcademyMutations()
  const { isConnected } = useAcademyRealtime()

  const handleStartCourse = async () => {
    try {
      await updateUserProgress.mutateAsync({
        course_id: course.id,
        progress_percentage: 5,
        status: 'in_progress',
        time_spent: 1
      })
      onProgressUpdate?.()
    } catch (error) {
      console.error('Error starting course:', error)
    }
  }

  const handleUpdateProgress = async (percentage: number) => {
    try {
      const status = percentage >= 100 ? 'completed' : 'in_progress'
      await updateUserProgress.mutateAsync({
        course_id: course.id,
        progress_percentage: percentage,
        status,
        time_spent: Math.floor(timeSpent / 60) // Convertir a minutos
      })
      onProgressUpdate?.()
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const currentProgress = userProgress?.progress_percentage || 0
  const isCompleted = userProgress?.status === 'completed'
  const isInProgress = userProgress?.status === 'in_progress'

  return (
    <Card className="border-0.5 border-black rounded-[10px]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tu Progreso</span>
          <div className="flex items-center gap-2">
            {isConnected && (
              <Badge variant="outline" className="text-academia-success border-academia-success/20 bg-academia-success/10">
                <div className="w-2 h-2 bg-academia-success rounded-full mr-1 animate-pulse" />
                En vivo
              </Badge>
            )}
            {isCompleted && (
              <Badge className="bg-academia-success text-academia-success-foreground">
                <Trophy className="h-3 w-3 mr-1" />
                Completado
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progreso del curso</span>
            <span className="font-semibold">{currentProgress}%</span>
          </div>
          <Progress value={currentProgress} className="h-3" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-academia">{course.total_lessons}</div>
            <div className="text-xs text-muted-foreground">Lecciones</div>
          </div>
          <div>
            <div className="text-lg font-bold text-academia-intermediate">{Math.floor((userProgress?.time_spent || 0) / 60)}</div>
            <div className="text-xs text-muted-foreground">Minutos</div>
          </div>
          <div>
            <div className="text-lg font-bold text-academia-success">{isCompleted ? '100' : Math.floor(currentProgress)}</div>
            <div className="text-xs text-muted-foreground">% Completo</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isInProgress && !isCompleted && (
            <Button 
              onClick={handleStartCourse} 
              className="w-full bg-academia text-academia-foreground hover:bg-academia/90"
              disabled={updateUserProgress.isPending}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Comenzar Curso
            </Button>
          )}

          {isInProgress && !isCompleted && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleUpdateProgress(Math.min(currentProgress + 25, 90))}
                  variant="outline" 
                  size="sm"
                  disabled={updateUserProgress.isPending}
                >
                  +25%
                </Button>
                <Button 
                  onClick={() => handleUpdateProgress(100)}
                  className="flex-1 bg-academia-success text-academia-success-foreground hover:bg-academia-success/90"
                  disabled={updateUserProgress.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar Completo
                </Button>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="text-center p-4 bg-academia-success-soft rounded-lg border border-academia-success/20">
              <CheckCircle className="h-8 w-8 text-academia-success mx-auto mb-2" />
              <p className="font-medium text-academia-success">¡Curso Completado!</p>
              <p className="text-sm text-academia-success/80">
                Completado el {userProgress?.completed_at ? new Date(userProgress.completed_at).toLocaleDateString() : 'hoy'}
              </p>
            </div>
          )}
        </div>

        {/* Time Tracker */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Tiempo de estudio
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setTimeSpent(prev => prev + 900)} // +15 min
              >
                +15min
              </Button>
              <span className="font-medium">{Math.floor(timeSpent / 60)}min</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}