
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export interface Case {
  id: string
  title: string
  description: string | null
  status: string
  client_id: string
  org_id: string
  created_at: string
  updated_at: string | null
  client?: {
    name: string
    email: string | null
  }
}

export const useCases = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')

  const { data: cases = [], isLoading, error, refetch } = useQuery({
    queryKey: ['cases', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) {
        console.log('📁 No org_id disponible para obtener casos')
        return []
      }
      
      console.log('📁 Obteniendo casos para org:', user.org_id)
      
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          client:clients(name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching cases:', error)
        throw error
      }
      
      console.log('✅ Casos obtenidos:', data?.length || 0)
      return data || []
    },
    enabled: !!user?.org_id,
  })

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter
    const matchesClient = clientFilter === 'all' || case_.client_id === clientFilter

    return matchesSearch && matchesStatus && matchesClient
  })

  return {
    cases,
    filteredCases,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    clientFilter,
    setClientFilter
  }
}
