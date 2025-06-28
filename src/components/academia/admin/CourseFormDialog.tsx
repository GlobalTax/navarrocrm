
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
import { useAcademyCoursesMutation } from '@/hooks/useAcademyAdmin'

const courseSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'La categoría es obligatoria'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  estimated_duration: z.number().min(1, 'La duración debe ser mayor a 0').optional(),
  is_published: z.boolean()
})

type CourseFormData = z.infer<typeof courseSchema>

interface CourseFormDialogProps {
  open: boolean
  onClose: () => void
  course?: any
  categories: any[]
}

export function CourseFormDialog({ open, onClose, course, categories }: CourseFormDialogProps) {
  const { createCourse, updateCourse } = useAcademyCoursesMutation()
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
      if (isEditing) {
        await updateCourse.mutateAsync({ id: course.id, ...data })
      } else {
        await createCourse.mutateAsync(data)
      }
      onClose()
      form.reset()
    } catch (error) {
      console.error('Error saving course:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
                  <FormLabel>Título del Curso</FormLabel>
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
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
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
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createCourse.isPending || updateCourse.isPending}>
                {isEditing ? 'Actualizar' : 'Crear'} Curso
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
