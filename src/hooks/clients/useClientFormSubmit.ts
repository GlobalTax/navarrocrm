
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { ClientFormData } from '@/components/clients/ClientFormTabs'
import type { Client } from './clientFormTypes'

export const useClientFormSubmit = (client: Client | null, onClose: () => void) => {
  const { user } = useApp()
  const isEditing = !!client

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
        relationship_type: 'cliente' as const,
      }

      if (isEditing && client) {
        const { error } = await supabase
          .from('contacts')
          .update(clientData)
          .eq('id', client.id)

        if (error) throw error
        toast.success('Cliente actualizado exitosamente')
      } else {
        const { error } = await supabase
          .from('contacts')
          .insert(clientData)

        if (error) throw error
        toast.success('Cliente creado exitosamente')
      }

      onClose()
    } catch (error) {
      console.error('Error saving client:', error)
      toast.error('Error al guardar el cliente')
    }
  }

  return { onSubmit }
}
