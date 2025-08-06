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

const maintenanceSchema = z.object({
  equipment_id: z.string().min(1, 'Selecciona un equipo'),
  maintenance_type: z.enum(['preventive', 'corrective']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  scheduled_date: z.string().min(1, 'La fecha programada es requerida'),
  technician_id: z.string().optional(),
  description: z.string().min(1, 'La descripción es requerida'),
  estimated_cost: z.string().optional(),
})

type MaintenanceFormData = z.infer<typeof maintenanceSchema>

interface CreateMaintenanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateMaintenanceDialog({ open, onOpenChange, onSuccess }: CreateMaintenanceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      maintenance_type: 'preventive',
      priority: 'medium',
      scheduled_date: new Date().toISOString().split('T')[0],
    }
  })

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment-for-maintenance'],
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
        .select('id, name, brand, model, category, status')
        .eq('org_id', userData.org_id)
        .neq('status', 'retired')
        .order('name')

      if (error) throw error
      return data || []
    }
  })

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
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
        .order('email')

      if (error) throw error
      return data || []
    }
  })

  const onSubmit = async (data: MaintenanceFormData) => {
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

      const maintenanceData = {
        equipment_id: data.equipment_id,
        maintenance_type: data.maintenance_type,
        priority: data.priority,
        scheduled_date: data.scheduled_date,
        description: data.description,
        org_id: userData.org_id,
        technician_id: data.technician_id || null,
        estimated_cost: data.estimated_cost ? parseFloat(data.estimated_cost) : null,
        status: 'scheduled',
        created_by: user.user.id,
      }

      const { error } = await supabase
        .from('equipment_maintenance')
        .insert(maintenanceData)

      if (error) throw error

      toast.success("El mantenimiento ha sido programado exitosamente.")

      form.reset()
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || "No se pudo programar el mantenimiento")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Programar Mantenimiento</DialogTitle>
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
                name="maintenance_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Mantenimiento *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="preventive">Preventivo</SelectItem>
                        <SelectItem value="corrective">Correctivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduled_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Programada *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="technician_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Técnico Asignado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar técnico" />
                        </SelectTrigger>
                      </FormControl>
                       <SelectContent>
                         <SelectItem value="none">Sin asignar</SelectItem>
                        {technicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id}>
                            {tech.email}
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
                name="estimated_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo Estimado (€)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción detallada del mantenimiento a realizar..."
                      className="resize-none"
                      rows={4}
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
                    Programando...
                  </>
                ) : (
                  'Programar Mantenimiento'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}