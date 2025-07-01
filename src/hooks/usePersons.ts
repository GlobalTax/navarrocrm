
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { Contact } from '@/hooks/useContacts'

export interface Person extends Contact {
  client_type: 'particular' | 'autonomo'
  company?: {
    id: string
    name: string
  } | null
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

      // Obtener personas físicas con información de empresa si está vinculada
      const { data: personsData, error: personsError } = await supabase
        .from('contacts')
        .select(`
          *,
          company:company_id(
            id,
            name
          )
        `)
        .eq('org_id', user.org_id)
        .in('client_type', ['particular', 'autonomo'])
        .order('name', { ascending: true })

      if (personsError) {
        console.error('❌ Error fetching persons:', personsError)
        throw personsError
      }
      
      console.log('✅ Persons fetched:', personsData?.length || 0)
      
      return (personsData || []).map(person => ({
        ...person,
        client_type: (person.client_type as 'particular' | 'autonomo') || 'particular',
        relationship_type: (person.relationship_type as 'prospecto' | 'cliente' | 'ex_cliente') || 'prospecto',
        company: person.company ? {
          id: person.company.id,
          name: person.company.name
        } : null
      }))
    },
    enabled: !!user?.org_id,
  })

  const filteredPersons = persons.filter(person => {
    // Verificación segura de búsqueda
    const matchesSearch = !searchTerm || 
      person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (person.email && person.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (person.phone && person.phone.includes(searchTerm)) ||
      (person.company?.name && person.company.name.toLowerCase().includes(searchTerm.toLowerCase()))

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
