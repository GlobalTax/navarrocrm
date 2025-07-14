import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const assignmentSchema = z.object({
  equipment_id: z.string().min(1, 'Selecciona un equipo'),
  assigned_to: z.string().min(1, 'Selecciona un usuario'),
  assignment_type: z.enum(['permanent', 'temporary', 'project']),
  start_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().optional(),
  location: z.string().optional(),
  purpose: z.string().optional(),
  notes: z.string().optional(),
})

type AssignmentFormData = z.infer<typeof assignmentSchema>

interface CreateAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateAssignmentDialog({ open, onOpenChange, onSuccess }: CreateAssignmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      assignment_type: 'permanent',
      start_date: new Date().toISOString().split('T')[0],
    }
  })

  const { data: equipment = [] } = useQuery({
    queryKey: ['available-equipment'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return []

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.user.id)
        .single()

      if (!userData?.org_id) return []

      const { data, error } = await supabase
        .from('equipment_inventory')
        .select('id, name, brand, model, category')
        .eq('org_id', userData.org_id)
        .eq('status', 'available')
        .order('name')

      if (error) throw error
      return data || []
    }
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users-for-assignment'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return []

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.user.id)
        .single()

      if (!userData?.org_id) return []

      const { data, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('org_id', userData.org_id)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    }
  })

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      setIsSubmitting(true)

      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('No authenticated user')

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.user.id)
        .single()

      if (!userData?.org_id) throw new Error('User not in organization')

      // Create assignment
      const assignmentData = {
        equipment_id: data.equipment_id,
        assigned_to: data.assigned_to,
        assignment_type: data.assignment_type,
        start_date: data.start_date,
        end_date: data.end_date || null,
        location: data.location || null,
        purpose: data.purpose || null,
        notes: data.notes || null,
        org_id: userData.org_id,
        assigned_by: user.user.id,
        status: 'active',
      }

      const { error: assignmentError } = await supabase
        .from('equipment_assignments')
        .insert(assignmentData)

      if (assignmentError) throw assignmentError

      // Update equipment status to assigned
      const { error: equipmentError } = await supabase
        .from('equipment_inventory')
        .update({
          status: 'assigned',
          assigned_to: data.assigned_to
        })
        .eq('id', data.equipment_id)

      if (equipmentError) throw equipmentError

      toast.success("El equipo ha sido asignado exitosamente.")

      form.reset()
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || "No se pudo crear la asignación")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva Asignación de Equipo</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="equipment_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipo *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar equipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {equipment.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} {item.brand && `- ${item.brand}`} {item.model && `${item.model}`}
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
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asignar a *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar usuario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.email}
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
                name="assignment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Asignación *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="permanent">Permanente</SelectItem>
                        <SelectItem value="temporary">Temporal</SelectItem>
                        <SelectItem value="project">Por Proyecto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Inicio *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Fin</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="Oficina, Casa, Proyecto X..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Propósito</FormLabel>
                  <FormControl>
                    <Input placeholder="Trabajo diario, proyecto específico..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas adicionales sobre la asignación..."
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Asignando...
                  </>
                ) : (
                  'Crear Asignación'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}