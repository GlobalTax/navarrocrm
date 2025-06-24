
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'
import type { Contact } from './contactFormTypes'

export const useContactFormSubmit = (contact: Contact | null, onClose: () => void) => {
  const { user } = useApp()
  const isEditing = !!contact

  const onSubmit = async (data: ContactFormData) => {
    if (!user?.org_id) {
      toast.error('Error: No se pudo identificar la organización')
      return
    }

    try {
      const contactData = {
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
        relationship_type: data.relationship_type,
        tags: data.tags || null,
        internal_notes: data.internal_notes || null,
        org_id: user.org_id,
        last_contact_date: new Date().toISOString(),
      }

      if (isEditing && contact) {
        const { error } = await supabase
          .from('contacts')
          .update(contactData)
          .eq('id', contact.id)

        if (error) throw error
        toast.success('Contacto actualizado exitosamente')
      } else {
        const { error } = await supabase
          .from('contacts')
          .insert(contactData)

        if (error) throw error
        toast.success('Contacto creado exitosamente')
      }

      onClose()
    } catch (error) {
      console.error('Error saving contact:', error)
      toast.error('Error al guardar el contacto')
    }
  }

  return { onSubmit }
}
