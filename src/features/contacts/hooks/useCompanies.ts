/**
 * Companies Hooks
 * 
 * Hooks específicos para empresas
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useApp } from '@/contexts/AppContext'
import { contactsService } from '../services/ContactsService'
import { Company } from '../types'

/**
 * Hook para gestionar empresas
 */
export const useCompanies = () => {
  const { user } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sectorFilter, setSectorFilter] = useState<string>('all')

  const { data: companies = [], isLoading, error, refetch } = useQuery({
    queryKey: ['companies', user?.org_id],
    queryFn: async (): Promise<Company[]> => {
      console.log('🔄 [useCompanies] Fetching companies for org:', user?.org_id)
      
      if (!user?.org_id) {
        console.log('❌ [useCompanies] No org_id available')
        return []
      }

      return contactsService.getCompanies(user.org_id)
    },
    enabled: !!user?.org_id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
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

// Re-export type
export type { Company }