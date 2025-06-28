
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAcademyLessonsMutation } from '@/hooks/useAcademyAdmin'

const lessonSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  content: z.string().min(1, 'El contenido es obligatorio'),
  lesson_type: z.enum(['text', 'interactive', 'quiz']),
  estimated_duration: z.number().min(1, 'La duración debe ser mayor a 0').optional(),
  sort_order: z.number().min(0).optional(),
  is_published: z.boolean(),
  learning_objectives: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional()
})

type LessonFormData = z.infer<typeof lessonSchema>

interface LessonFormDialogProps {
  open: boolean
  onClose: () => void
  courseId: string
  lesson?: {
    id: string
    title: string
    content: string
    lesson_type: 'text' | 'interactive' | 'quiz'
    estimated_duration?: number
    sort_order?: number
    is_published: boolean
    learning_objectives?: string[]
    prerequisites?: string[]
  }
}

export function LessonFormDialog({ open, onClose, courseId, lesson }: LessonFormDialogProps) {
  const { createLesson, updateLesson } = useAcademyLessonsMutation()
  const isEditing = !!lesson

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title || '',
      content: lesson?.content || '',
      lesson_type: lesson?.lesson_type || 'text',
      estimated_duration: lesson?.estimated_duration || undefined,
      sort_order: lesson?.sort_order || 0,
      is_published: lesson?.is_published || false,
      learning_objectives: lesson?.learning_objectives || [],
      prerequisites: lesson?.prerequisites || []
    }
  })

  const onSubmit = async (data: LessonFormData) => {
    try {
      if (isEditing && lesson) {
        await updateLesson.mutateAsync({ 
          id: lesson.id, 
          course_id: courseId, 
          title: data.title,
          content: data.content,
          lesson_type: data.lesson_type,
          estimated_duration: data.estimated_duration,
          sort_order: data.sort_order,
          is_published: data.is_published,
          learning_objectives: data.learning_objectives,
          prerequisites: data.prerequisites
        })
      } else {
        await createLesson.mutateAsync({ 
          course_id: courseId, 
          title: data.title,
          content: data.content,
          lesson_type: data.lesson_type,
          estimated_duration: data.estimated_duration,
          sort_order: data.sort_order,
          is_published: data.is_published,
          learning_objectives: data.learning_objectives,
          prerequisites: data.prerequisites
        })
      }
      onClose()
      form.reset()
    } catch (error) {
      console.error('Error saving lesson:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Lección' : 'Nueva Lección'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título de la Lección</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Introducción a la gestión de clientes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lesson_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Lección</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">Texto/Lectura</SelectItem>
                      <SelectItem value="interactive">Interactiva</SelectItem>
                      <SelectItem value="quiz">Cuestionario</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido de la Lección</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="min-h-[200px]"
                      placeholder="Escribe aquí el contenido completo de la lección..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimated_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración Estimada (minutos)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="15"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 border-0.5 border-black">
                  <div className="space-y-0.5">
                    <FormLabel>Publicar Lección</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Las lecciones publicadas son visibles para los estudiantes
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createLesson.isPending || updateLesson.isPending}>
                {isEditing ? 'Actualizar' : 'Crear'} Lección
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
