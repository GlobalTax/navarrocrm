import { useState, useEffect } from 'react'
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
import { toast } from '@/hooks/use-toast'
import { QrCode, Loader2, Trash2 } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

const equipmentSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  category: z.string().min(1, 'La categoría es requerida'),
  brand: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  description: z.string().optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  status: z.enum(['available', 'assigned', 'maintenance', 'retired']),
  purchase_date: z.string().optional(),
  purchase_cost: z.string().optional(),
  warranty_expiry: z.string().optional(),
  room_id: z.string().optional(),
  notes: z.string().optional(),
})

type EquipmentFormData = z.infer<typeof equipmentSchema>

interface EditEquipmentDialogProps {
  equipment: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditEquipmentDialog({ equipment, open, onOpenChange, onSuccess }: EditEquipmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [generatingQR, setGeneratingQR] = useState(false)

  const form = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
  })

  const { data: rooms = [] } = useQuery({
    queryKey: ['office-rooms'],
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
        .from('office_rooms')
        .select('id, name')
        .eq('org_id', userData.org_id)
        .eq('is_active', true)
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
        .select('id, name, email')
        .eq('org_id', userData.org_id)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    }
  })

  useEffect(() => {
    if (equipment && open) {
      form.reset({
        name: equipment.name || '',
        category: equipment.category || '',
        brand: equipment.brand || '',
        model: equipment.model || '',
        serial_number: equipment.serial_number || '',
        description: equipment.description || '',
        condition: equipment.condition || 'excellent',
        status: equipment.status || 'available',
        purchase_date: equipment.purchase_date || '',
        purchase_cost: equipment.purchase_cost?.toString() || '',
        warranty_expiry: equipment.warranty_expiry || '',
        room_id: equipment.room_id || '',
        notes: equipment.notes || '',
      })
    }
  }, [equipment, open, form])

  const generateQRCode = () => {
    setGeneratingQR(true)
    const qrCode = `EQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    form.setValue('serial_number', qrCode)
    setTimeout(() => setGeneratingQR(false), 500)
  }

  const onSubmit = async (data: EquipmentFormData) => {
    try {
      setIsSubmitting(true)

      const equipmentData = {
        ...data,
        purchase_cost: data.purchase_cost ? parseFloat(data.purchase_cost) : null,
        purchase_date: data.purchase_date || null,
        warranty_expiry: data.warranty_expiry || null,
        room_id: data.room_id || null,
        qr_code: data.serial_number || null,
      }

      const { error } = await supabase
        .from('equipment_inventory')
        .update(equipmentData)
        .eq('id', equipment.id)

      if (error) throw error

      toast({
        title: "Equipo actualizado",
        description: "Los cambios han sido guardados exitosamente.",
      })

      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el equipo",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)

      // Check if equipment has active assignments
      const { data: assignments } = await supabase
        .from('equipment_assignments')
        .select('id')
        .eq('equipment_id', equipment.id)
        .eq('status', 'active')

      if (assignments && assignments.length > 0) {
        toast({
          title: "No se puede eliminar",
          description: "El equipo tiene asignaciones activas. Primero debe desasignarlo.",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase
        .from('equipment_inventory')
        .delete()
        .eq('id', equipment.id)

      if (error) throw error

      toast({
        title: "Equipo eliminado",
        description: "El equipo ha sido eliminado exitosamente.",
      })

      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el equipo",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Editar Equipo
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar equipo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. El equipo será eliminado permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Eliminando...
                      </>
                    ) : (
                      'Eliminar'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Equipo *</FormLabel>
                    <FormControl>
                      <Input placeholder="MacBook Pro, Monitor Dell..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="laptop">Laptop</SelectItem>
                        <SelectItem value="desktop">Escritorio</SelectItem>
                        <SelectItem value="monitor">Monitor</SelectItem>
                        <SelectItem value="printer">Impresora</SelectItem>
                        <SelectItem value="phone">Teléfono</SelectItem>
                        <SelectItem value="tablet">Tablet</SelectItem>
                        <SelectItem value="accessory">Accesorio</SelectItem>
                        <SelectItem value="furniture">Mobiliario</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Apple, Dell, HP..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="MacBook Pro 13, OptiPlex 7090..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serial_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Serie / Código QR</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="Número de serie o código" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={generateQRCode}
                        disabled={generatingQR}
                      >
                        {generatingQR ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <QrCode className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="room_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar sala" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Sin asignar</SelectItem>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name}
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
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="excellent">Excelente</SelectItem>
                        <SelectItem value="good">Bueno</SelectItem>
                        <SelectItem value="fair">Regular</SelectItem>
                        <SelectItem value="poor">Malo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disponibilidad *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Disponible</SelectItem>
                        <SelectItem value="assigned">Asignado</SelectItem>
                        <SelectItem value="maintenance">Mantenimiento</SelectItem>
                        <SelectItem value="retired">Retirado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchase_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Compra</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchase_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo de Compra (€)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warranty_expiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vencimiento Garantía</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción detallada del equipo..."
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
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
                      placeholder="Notas adicionales..."
                      className="resize-none"
                      rows={2}
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
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}