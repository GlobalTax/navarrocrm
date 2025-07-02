
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

interface ProspectData {
  name: string
  email: string
  phone: string
  client_type: 'particular' | 'empresa'
  dni_nif: string
  business_sector?: string
  how_found_us?: string
  internal_notes?: string
}

export const useProspectToClient = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const [prospectData, setProspectData] = useState<ProspectData>({
    name: '',
    email: '',
    phone: '',
    client_type: 'particular',
    dni_nif: '',
    business_sector: '',
    how_found_us: '',
    internal_notes: ''
  })

  const createClientFromProspect = useMutation({
    mutationFn: async (data: ProspectData) => {
      if (!user?.org_id) throw new Error('Usuario no autenticado')

      const contactData = {
        org_id: user.org_id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        client_type: data.client_type,
        dni_nif: data.dni_nif,
        business_sector: data.business_sector,
        how_found_us: data.how_found_us,
        internal_notes: data.internal_notes,
        status: 'activo',
        relationship_type: 'cliente',
        contact_preference: 'email',
        preferred_language: 'es'
      }

      const { data: contact, error } = await supabase
        .from('contacts')
        .insert(contactData)
        .select()
        .maybeSingle()

      if (error) throw error
      return contact
    },
    onSuccess: (contact) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success(`Cliente "${contact.name}" creado exitosamente`)
    },
    onError: (error) => {
      console.error('Error creating client from prospect:', error)
      toast.error('Error al crear el cliente')
    }
  })

  const resetProspectData = () => {
    setProspectData({
      name: '',
      email: '',
      phone: '',
      client_type: 'particular',
      dni_nif: '',
      business_sector: '',
      how_found_us: '',
      internal_notes: ''
    })
  }

  return {
    prospectData,
    setProspectData,
    createClientFromProspect,
    isCreating: createClientFromProspect.isPending,
    resetProspectData
  }
}
