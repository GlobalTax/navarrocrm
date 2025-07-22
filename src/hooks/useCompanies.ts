import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { Contact } from '@/hooks/useContacts'
import { parseEmailPreferences, defaultEmailPreferences } from '@/lib/typeUtils'

export interface Company extends Contact {
  client_type: 'empresa'
  primary_contact?: {
    id: string
    name: string
    email: string | null
    phone: string | null
  } | null
  total_contacts?: number
}

export const useCompanies = () => {
  const { user } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sectorFilter, setSectorFilter] = useState<string>('all')

  const { data: companies = [], isLoading, error, refetch } = useQuery({
    queryKey: ['companies', user?.org_id],
    queryFn: async (): Promise<Company[]> => {
      console.log('🔄 Fetching companies for org:', user?.org_id)
      
      if (!user?.org_id) {
        console.log('❌ No org_id available')
        return []
      }

      // Obtener empresas
      const { data: companiesData, error: companiesError } = await supabase
        .from('contacts')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('client_type', 'empresa')
        .order('name', { ascending: true })

      if (companiesError) {
        console.error('❌ Error fetching companies:', companiesError)
        throw companiesError
      }

      // Para cada empresa, obtener información de contactos vinculados con manejo seguro de errores
      const companiesWithContacts = await Promise.all(
        (companiesData || []).map(async (company) => {
          try {
            const { data: contactsData, error: contactsError } = await supabase
              .from('contacts')
              .select('id, name, email, phone')
              .eq('company_id', company.id)
              .eq('org_id', user.org_id)
              .limit(1)

            if (contactsError) {
              console.warn('⚠️ Error fetching company contacts for', company.name, ':', contactsError)
            }

            const { count: totalContacts } = await supabase
              .from('contacts')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', company.id)
              .eq('org_id', user.org_id)

            return {
              ...company,
              client_type: 'empresa' as const,
              relationship_type: (company.relationship_type as 'prospecto' | 'cliente' | 'ex_cliente') || 'prospecto',
              email_preferences: parseEmailPreferences(company.email_preferences) || defaultEmailPreferences,
              primary_contact: contactsData?.[0] || null,
              total_contacts: totalContacts || 0
            }
          } catch (error) {
            console.error('❌ Error processing company', company.name, ':', error)
            return {
              ...company,
              client_type: 'empresa' as const,
              relationship_type: (company.relationship_type as 'prospecto' | 'cliente' | 'ex_cliente') || 'prospecto',
              email_preferences: parseEmailPreferences(company.email_preferences) || defaultEmailPreferences,
              primary_contact: null,
              total_contacts: 0
            }
          }
        })
      )
      
      console.log('✅ Companies fetched:', companiesWithContacts.length)
      
      return companiesWithContacts
    },
    enabled: !!user?.org_id,
  })

  const filteredCompanies = companies.filter(company => {
    // Verificación segura de búsqueda
    const matchesSearch = !searchTerm || 
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.email && company.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company.phone && company.phone.includes(searchTerm)) ||
      (company.primary_contact?.name && company.primary_contact.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || company.status === statusFilter

    const matchesSector = sectorFilter === 'all' || company.business_sector === sectorFilter

    return matchesSearch && matchesStatus && matchesSector
  })

  return {
    companies,
    filteredCompanies,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sectorFilter,
    setSectorFilter,
  }
}
