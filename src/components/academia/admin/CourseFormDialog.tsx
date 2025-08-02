
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
import { useAcademyMutations } from '@/hooks/academy/useAcademyMutations'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AcademyCourse, AcademyCategory, CourseFormData } from '@/types/academy'
import { COURSE_LEVELS } from '@/types/academy'
import { logger } from '@/utils/logging'

const courseSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(255, 'El título es muy largo'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'La categoría es obligatoria'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  estimated_duration: z.number().min(1, 'La duración debe ser mayor a 0').optional(),
  is_published: z.boolean()
})

interface CourseFormDialogProps {
  open: boolean
  onClose: () => void
  course?: AcademyCourse | null
  categories: AcademyCategory[]
}

export function CourseFormDialog({ open, onClose, course, categories }: CourseFormDialogProps) {
  const { createCourse, updateCourse } = useAcademyMutations()
  const isEditing = !!course

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title || '',
      description: course?.description || '',
      category_id: course?.category_id || '',
      level: course?.level || 'beginner',
      estimated_duration: course?.estimated_duration || undefined,
      is_published: course?.is_published || false
    }
  })

  const onSubmit = async (data: CourseFormData) => {
    try {
      logger.info('Submitting course form', { 
        component: 'CourseFormDialog',
        courseTitle: data.title,
        categoryId: data.category_id,
        isEditing
      })

      // Validación adicional en el frontend
      if (!data.category_id) {
        toast.error('Por favor selecciona una categoría')
        return
      }

      const selectedCategory = categories.find(cat => cat.id === data.category_id)
      if (!selectedCategory) {
        toast.error('La categoría seleccionada no es válida')
        return
      }

      if (isEditing && course) {
        logger.info('Updating existing course', { 
          component: 'CourseFormDialog',
          courseId: course.id,
          title: data.title
        })
        await updateCourse.mutateAsync({ 
          id: course.id, 
          ...data
        })
      } else {
        logger.info('Creating new course', { 
          component: 'CourseFormDialog',
          title: data.title
        })
        const result = await createCourse.mutateAsync(data)
        logger.info('Course created successfully', { 
          component: 'CourseFormDialog',
          courseId: result?.id,
          title: data.title
        })
      }
      
      logger.info('Course operation completed successfully', { 
        component: 'CourseFormDialog',
        isEditing 
      })
      handleClose()
    } catch (error) {
      console.error('❌ Error saving course:', error)
      // El error ya se maneja en el hook con toast
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const isLoading = createCourse.isPending || updateCourse.isPending

  // Reset form when dialog opens with new course data
  React.useEffect(() => {
    if (open) {
      const formData = {
        title: course?.title || '',
        description: course?.description || '',
        category_id: course?.category_id || '',
        level: course?.level || 'beginner' as const,
        estimated_duration: course?.estimated_duration || undefined,
        is_published: course?.is_published || false
      }
      logger.debug('Resetting form with data', { 
        component: 'CourseFormDialog',
        title: formData.title,
        categoryId: formData.category_id
      })
      form.reset(formData)
    }
  }, [open, course, form])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Curso' : 'Nuevo Curso'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del Curso *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Gestión de Clientes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Describe el contenido del curso..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">
                          No hay categorías disponibles. Crea una categoría primero.
                        </div>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(COURSE_LEVELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="120"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 border-0.5 border-black">
                  <div className="space-y-0.5">
                    <FormLabel>Publicar Curso</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Los cursos publicados son visibles para todos los usuarios
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
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || categories.length === 0}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? 'Actualizar' : 'Crear'} Curso
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
