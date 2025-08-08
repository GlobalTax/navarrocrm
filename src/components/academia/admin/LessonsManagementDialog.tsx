
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, BookOpen, Clock, ChevronUp, ChevronDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useAcademyMutations } from '@/hooks/academy/useAcademyMutations'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import type { AcademyLesson } from '@/types/academy'

interface LessonsManagementDialogProps {
  open: boolean
  onClose: () => void
  courseId: string
  courseTitle: string
  onEditLesson: (lesson: AcademyLesson) => void
  onCreateLesson: () => void
}

export function LessonsManagementDialog({ 
  open, 
  onClose, 
  courseId, 
  courseTitle,
  onEditLesson,
  onCreateLesson
}: LessonsManagementDialogProps) {
  const { user } = useApp()
  const { deleteLesson } = useAcademyMutations()
  const [lessonToDelete, setLessonToDelete] = useState<AcademyLesson | null>(null)
  const [activeTab, setActiveTab] = useState('published')

  // Fetch lessons for this course
  const { data: lessons, isLoading } = useQuery({
    queryKey: ['academy-lessons', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academy_lessons')
        .select('*')
        .eq('course_id', courseId)
        .eq('org_id', user?.org_id)
        .order('sort_order')

      if (error) throw error
      return data as AcademyLesson[]
    },
    enabled: open && !!courseId && !!user?.org_id
  })

  const publishedLessons = lessons?.filter(lesson => lesson.is_published) || []
  const draftLessons = lessons?.filter(lesson => !lesson.is_published) || []

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return
    
    try {
      await deleteLesson.mutateAsync({ 
        id: lessonToDelete.id, 
        course_id: courseId 
      })
      setLessonToDelete(null)
    } catch (error) {
      console.error('Error deleting lesson:', error)
    }
  }

  const getLessonTypeLabel = (type: string) => {
    const labels = {
      text: 'Texto',
      interactive: 'Interactivo',
      quiz: 'Quiz'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getLessonTypeColor = (type: string) => {
    const colors = {
      text: 'bg-academia-info-soft text-academia-info border-academia-info/20',
      interactive: 'bg-academia-success-soft text-academia-success border-academia-success/20',
      quiz: 'bg-academia-intermediate-soft text-academia-intermediate border-academia-intermediate/20'
    }
    return colors[type as keyof typeof colors] || 'bg-muted text-muted-foreground border-border'
  }

  const LessonCard = ({ lesson }: { lesson: AcademyLesson }) => (
    <Card className="border-0.5 border-black rounded-[10px] hover:shadow-sm transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-medium mb-2">{lesson.title}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${getLessonTypeColor(lesson.lesson_type)} text-xs border`}>
                {getLessonTypeLabel(lesson.lesson_type)}
              </Badge>
              {lesson.estimated_duration && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {lesson.estimated_duration} min
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{lesson.content.substring(0, 100)}...</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <div className="flex flex-col items-center gap-1">
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <ChevronUp className="h-3 w-3" />
              </Button>
              <span className="text-xs text-gray-500">#{lesson.sort_order}</span>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Creado: {new Date(lesson.created_at).toLocaleDateString('es-ES')}
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEditLesson(lesson)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setLessonToDelete(lesson)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Lecciones - {courseTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Total: {lessons?.length || 0} lecciones
              </div>
              <Button onClick={onCreateLesson} className="bg-black hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Lección
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="published">
                    Publicadas ({publishedLessons.length})
                  </TabsTrigger>
                  <TabsTrigger value="drafts">
                    Borradores ({draftLessons.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="published" className="mt-6">
                  {publishedLessons.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay lecciones publicadas
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Las lecciones publicadas aparecerán aquí
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {publishedLessons.map((lesson) => (
                        <LessonCard key={lesson.id} lesson={lesson} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="drafts" className="mt-6">
                  {draftLessons.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay borradores
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Los borradores de lecciones aparecerán aquí
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {draftLessons.map((lesson) => (
                        <LessonCard key={lesson.id} lesson={lesson} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!lessonToDelete} onOpenChange={() => setLessonToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Lección?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La lección "{lessonToDelete?.title}" será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
              className="bg-academia-error text-academia-error-foreground hover:bg-academia-error/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
