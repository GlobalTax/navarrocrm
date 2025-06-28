
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
import { useAcademyCategoriesMutation } from '@/hooks/useAcademyAdmin'

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().min(1, 'El color es obligatorio'),
  sort_order: z.number().min(0).optional(),
  is_active: z.boolean()
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormDialogProps {
  open: boolean
  onClose: () => void
  category?: {
    id: string
    name: string
    description?: string
    icon?: string
    color: string
    sort_order?: number
    is_active: boolean
  }
}

const iconOptions = [
  { value: 'Users', label: 'Usuarios' },
  { value: 'FileText', label: 'Documentos' },
  { value: 'Brain', label: 'Inteligencia' },
  { value: 'Settings', label: 'Configuración' },
  { value: 'BookOpen', label: 'Libro' },
  { value: 'Shield', label: 'Seguridad' },
  { value: 'Briefcase', label: 'Negocios' }
]

const colorOptions = [
  { value: '#3B82F6', label: 'Azul', color: '#3B82F6' },
  { value: '#10B981', label: 'Verde', color: '#10B981' },
  { value: '#8B5CF6', label: 'Violeta', color: '#8B5CF6' },
  { value: '#F59E0B', label: 'Amarillo', color: '#F59E0B' },
  { value: '#EF4444', label: 'Rojo', color: '#EF4444' },
  { value: '#6B7280', label: 'Gris', color: '#6B7280' }
]

export function CategoryFormDialog({ open, onClose, category }: CategoryFormDialogProps) {
  const { createCategory, updateCategory } = useAcademyCategoriesMutation()
  const isEditing = !!category

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      icon: category?.icon || 'BookOpen',
      color: category?.color || '#3B82F6',
      sort_order: category?.sort_order || 0,
      is_active: category?.is_active ?? true
    }
  })

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEditing && category) {
        await updateCategory.mutateAsync({ 
          id: category.id, 
          name: data.name,
          description: data.description,
          icon: data.icon,
          color: data.color,
          sort_order: data.sort_order,
          is_active: data.is_active
        })
      } else {
        await createCategory.mutateAsync({
          name: data.name,
          description: data.description,
          icon: data.icon,
          color: data.color,
          sort_order: data.sort_order,
          is_active: data.is_active
        })
      }
      onClose()
      form.reset()
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Categoría</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Gestión Básica" />
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
                    <Textarea {...field} placeholder="Describe esta categoría..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icono</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border" 
                              style={{ backgroundColor: option.color }}
                            />
                            {option.label}
                          </div>
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
              name="sort_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orden de Clasificación</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 border-0.5 border-black">
                  <div className="space-y-0.5">
                    <FormLabel>Categoría Activa</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Las categorías activas son visibles en la academia
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
              <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
                {isEditing ? 'Actualizar' : 'Crear'} Categoría
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
