
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

interface Client {
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
  tags: string[] | null
  internal_notes: string | null
  last_contact_date: string | null
}

export const useClients = () => {
  const { user } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const { data: clients = [], isLoading, error, refetch } = useQuery({
    queryKey: ['clients', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) {
        console.log('👥 No org_id disponible para obtener clientes')
        return []
      }
      
      console.log('👥 Obteniendo clientes para org:', user.org_id)
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching clients:', error)
        throw error
      }
      
      console.log('✅ Clientes obtenidos:', data?.length || 0)
      return data || []
    },
    enabled: !!user?.org_id,
  })

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm) ||
      client.dni_nif?.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    const matchesType = typeFilter === 'all' || client.client_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  return {
    clients,
    filteredClients,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,  
    typeFilter,
    setTypeFilter
  }
}

export type { Client }
