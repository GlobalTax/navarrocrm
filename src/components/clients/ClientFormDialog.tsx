
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

const clientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').or(z.literal('')),
  phone: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormDialogProps {
  client?: {
    id: string
    name: string
    email: string | null
    phone: string | null
  } | null
  open: boolean
  onClose: () => void
}

export const ClientFormDialog = ({ client, open, onClose }: ClientFormDialogProps) => {
  const { user } = useAuth()
  const isEditing = !!client

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  })

  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
      })
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
      })
    }
  }, [client, form])

  const onSubmit = async (data: ClientFormData) => {
    if (!user?.org_id) {
      toast.error('Error: No se pudo identificar la organización')
      return
    }

    try {
      const clientData = {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        org_id: user.org_id,
      }

      if (isEditing && client) {
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', client.id)

        if (error) throw error
        toast.success('Cliente actualizado exitosamente')
      } else {
        const { error } = await supabase
          .from('clients')
          .insert(clientData)

        if (error) throw error
        toast.success('Cliente creado exitosamente')
      }

      form.reset()
      onClose()
    } catch (error) {
      console.error('Error saving client:', error)
      toast.error('Error al guardar el cliente')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre completo del cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="cliente@ejemplo.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+34 123 456 789" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Guardando...'
                  : isEditing
                  ? 'Actualizar'
                  : 'Crear Cliente'
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
