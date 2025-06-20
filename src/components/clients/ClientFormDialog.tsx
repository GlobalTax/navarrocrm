
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { ClientFormTabs, type ClientFormData } from './ClientFormTabs'

const clientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').or(z.literal('')),
  phone: z.string().optional(),
  dni_nif: z.string().optional(),
  address_street: z.string().optional(),
  address_city: z.string().optional(),
  address_postal_code: z.string().optional(),
  address_country: z.string().optional(),
  legal_representative: z.string().optional(),
  client_type: z.enum(['particular', 'empresa', 'autonomo']),
  business_sector: z.string().optional(),
  how_found_us: z.string().optional(),
  contact_preference: z.enum(['email', 'telefono', 'whatsapp', 'presencial']),
  preferred_language: z.enum(['es', 'ca', 'en']),
  hourly_rate: z.string().optional(),
  payment_method: z.enum(['transferencia', 'domiciliacion', 'efectivo', 'tarjeta']),
  status: z.enum(['activo', 'inactivo', 'prospecto', 'bloqueado']),
  tags: z.array(z.string()).optional(),
  internal_notes: z.string().optional(),
})

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  dni_nif: string | null
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_country: string | null
  legal_representative: string | null
  client_type: string | null
  business_sector: string | null
  how_found_us: string | null
  contact_preference: string | null
  preferred_language: string | null
  hourly_rate: number | null
  payment_method: string | null
  status: string | null
  tags: string[] | null
  internal_notes: string | null
}

interface ClientFormDialogProps {
  client?: Client | null
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
      dni_nif: '',
      address_street: '',
      address_city: '',
      address_postal_code: '',
      address_country: 'España',
      legal_representative: '',
      client_type: 'particular',
      business_sector: '',
      how_found_us: '',
      contact_preference: 'email',
      preferred_language: 'es',
      hourly_rate: '',
      payment_method: 'transferencia',
      status: 'prospecto',
      tags: [],
      internal_notes: '',
    },
  })

  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        dni_nif: client.dni_nif || '',
        address_street: client.address_street || '',
        address_city: client.address_city || '',
        address_postal_code: client.address_postal_code || '',
        address_country: client.address_country || 'España',
        legal_representative: client.legal_representative || '',
        client_type: (client.client_type as ClientFormData['client_type']) || 'particular',
        business_sector: client.business_sector || '',
        how_found_us: client.how_found_us || '',
        contact_preference: (client.contact_preference as ClientFormData['contact_preference']) || 'email',
        preferred_language: (client.preferred_language as ClientFormData['preferred_language']) || 'es',
        hourly_rate: client.hourly_rate?.toString() || '',
        payment_method: (client.payment_method as ClientFormData['payment_method']) || 'transferencia',
        status: (client.status as ClientFormData['status']) || 'prospecto',
        tags: client.tags || [],
        internal_notes: client.internal_notes || '',
      })
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        dni_nif: '',
        address_street: '',
        address_city: '',
        address_postal_code: '',
        address_country: 'España',
        legal_representative: '',
        client_type: 'particular',
        business_sector: '',
        how_found_us: '',
        contact_preference: 'email',
        preferred_language: 'es',
        hourly_rate: '',
        payment_method: 'transferencia',
        status: 'prospecto',
        tags: [],
        internal_notes: '',
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
        dni_nif: data.dni_nif || null,
        address_street: data.address_street || null,
        address_city: data.address_city || null,
        address_postal_code: data.address_postal_code || null,
        address_country: data.address_country || null,
        legal_representative: data.legal_representative || null,
        client_type: data.client_type,
        business_sector: data.business_sector || null,
        how_found_us: data.how_found_us || null,
        contact_preference: data.contact_preference,
        preferred_language: data.preferred_language,
        hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
        payment_method: data.payment_method,
        status: data.status,
        tags: data.tags || null,
        internal_notes: data.internal_notes || null,
        org_id: user.org_id,
        last_contact_date: new Date().toISOString(),
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ClientFormTabs form={form} />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Guardando...'
                  : isEditing
                  ? 'Actualizar Cliente'
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
