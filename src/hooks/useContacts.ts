
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface Contact {
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
  relationship_type: 'prospecto' | 'cliente' | 'ex_cliente'
  tags: string[] | null
  internal_notes: string | null
  org_id: string
  created_at: string
  updated_at: string
  last_contact_date: string | null
  company_id?: string | null
  timezone: string | null
  preferred_meeting_time: string | null
  email_preferences: {
    receive_followups: boolean
    receive_reminders: boolean
    receive_invitations: boolean
  } | null
}

export const useContacts = () => {
  const { user } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [relationshipFilter, setRelationshipFilter] = useState<string>('all')

  const { data: contacts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['contacts', user?.org_id],
    queryFn: async (): Promise<Contact[]> => {
      console.log('🔄 Fetching contacts for org:', user?.org_id)
      
      if (!user?.org_id) {
        console.log('❌ No org_id available')
        return []
      }

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('org_id', user.org_id)
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ Error fetching contacts:', error)
        throw error
      }
      
      console.log('✅ Contacts fetched:', data?.length || 0)
      
      // Asegurar que relationship_type tenga el tipo correcto
      return (data || []).map(contact => ({
        ...contact,
        relationship_type: (contact.relationship_type as 'prospecto' | 'cliente' | 'ex_cliente') || 'prospecto'
      }))
    },
    enabled: !!user?.org_id,
  })

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.phone && contact.phone.includes(searchTerm))

    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter

    const matchesRelationship = relationshipFilter === 'all' || contact.relationship_type === relationshipFilter

    return matchesSearch && matchesStatus && matchesRelationship
  })

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
    setRelationshipFilter,
  }
}
