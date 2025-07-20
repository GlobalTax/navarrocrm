
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { Contact } from '@/hooks/useContacts'
import { parseEmailPreferences, defaultEmailPreferences } from '@/lib/typeUtils'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useCompanies')

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
      logger.debug('Fetching companies for org:', user?.org_id)
      
      if (!user?.org_id) {
        logger.warn('No org_id available')
        return []
      }

      // OPTIMIZACIÓN: Una sola query con JOIN para obtener empresas y sus contactos primarios
      const { data: companiesData, error: companiesError } = await supabase
        .from('contacts')
        .select(`
          *,
          primary_contact:contacts!contacts_company_id_fkey(
            id,
            name,
            email,
            phone
          )
        `)
        .eq('org_id', user.org_id)
        .eq('client_type', 'empresa')
        .order('name', { ascending: true })

      if (companiesError) {
        logger.error('Error fetching companies:', companiesError)
        throw companiesError
      }

      // Procesar empresas con manejo seguro de errores
      const processedCompanies: Company[] = (companiesData || []).map(company => {
        try {
          // Tomar el primer contacto como contacto primario
          const primaryContact = Array.isArray(company.primary_contact) && company.primary_contact.length > 0
            ? company.primary_contact[0]
            : null

          return {
            ...company,
            client_type: 'empresa' as const,
            relationship_type: (company.relationship_type as 'prospecto' | 'cliente' | 'ex_cliente') || 'prospecto',
            email_preferences: parseEmailPreferences(company.email_preferences) || defaultEmailPreferences,
            primary_contact: primaryContact,
            total_contacts: Array.isArray(company.primary_contact) ? company.primary_contact.length : 0
          }
        } catch (error) {
          logger.error('Error processing company', company.name, ':', error)
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
      
      logger.info('Companies fetched successfully:', processedCompanies.length)
      return processedCompanies
    },
    enabled: !!user?.org_id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
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
