
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { Contact } from '@/hooks/useContacts'

export interface Person extends Contact {
  client_type: 'particular' | 'autonomo'
  company_id?: string | null
  company?: {
    id: string
    name: string
  }
}

export const usePersons = () => {
  const { user } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const { data: persons = [], isLoading, error, refetch } = useQuery({
    queryKey: ['persons', user?.org_id],
    queryFn: async (): Promise<Person[]> => {
      console.log('🔄 Fetching persons for org:', user?.org_id)
      
      if (!user?.org_id) {
        console.log('❌ No org_id available')
        return []
      }

      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          company:company_id (
            id,
            name
          )
        `)
        .eq('org_id', user.org_id)
        .in('client_type', ['particular', 'autonomo'])
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ Error fetching persons:', error)
        throw error
      }
      
      console.log('✅ Persons fetched:', data?.length || 0)
      
      return (data || []).map(person => ({
        ...person,
        client_type: person.client_type as 'particular' | 'autonomo',
        company: person.company || undefined
      }))
    },
    enabled: !!user?.org_id,
  })

  const filteredPersons = persons.filter(person => {
    const matchesSearch = !searchTerm || 
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (person.email && person.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (person.phone && person.phone.includes(searchTerm))

    const matchesStatus = statusFilter === 'all' || person.status === statusFilter

    const matchesType = typeFilter === 'all' || person.client_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  return {
    persons,
    filteredPersons,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
  }
}
