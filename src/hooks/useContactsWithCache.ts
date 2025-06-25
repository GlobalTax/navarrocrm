
import { useState } from 'react'
import { useCachedQuery } from '@/hooks/cache'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  created_at: string
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
  relationship_type: string | null
  tags: string[] | null
  internal_notes: string | null
  last_contact_date: string | null
}

export const useContactsWithCache = () => {
  const { user } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [relationshipFilter, setRelationshipFilter] = useState<string>('all')

  const { data: contacts = [], isLoading, error, invalidateCache } = useCachedQuery({
    queryKey: ['contacts', user?.org_id || ''],
    queryFn: async () => {
      if (!user?.org_id) {
        console.log('👥 No org_id disponible para obtener contactos')
        return []
      }
      
      console.log('👥 Obteniendo contactos desde API (cache miss):', user.org_id)
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching contacts:', error)
        throw error
      }
      
      console.log('✅ Contactos obtenidos desde API:', data?.length || 0)
      return data || []
    },
    cacheTTL: 10 * 60 * 1000, // 10 minutos (contacts don't change as frequently)
    reactQueryOptions: {
      enabled: !!user?.org_id,
    }
  })

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.includes(searchTerm) ||
      contact.dni_nif?.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
    const matchesRelationship = relationshipFilter === 'all' || contact.relationship_type === relationshipFilter

    return matchesSearch && matchesStatus && matchesRelationship
  })

  const refetch = () => {
    invalidateCache()
  }

  return {
    contacts,
    filteredContacts,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,  
    relationshipFilter,
    setRelationshipFilter
  }
}

export type { Contact }
