
// Legacy hook that works with existing components
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import type { Case, CreateCaseData, UpdateCaseData } from '@/types/features/cases'

export const useCases = () => {
  const { user } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [practiceAreaFilter, setPracticeAreaFilter] = useState<string>('all')
  const [solicitorFilter, setSolicitorFilter] = useState<string>('all')

  const { data: cases = [], isLoading, error, refetch } = useQuery({
    queryKey: ['cases', user?.org_id, statusFilter, practiceAreaFilter, solicitorFilter],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      let query = supabase
        .from('cases')
        .select('*')
        .eq('org_id', user.org_id)

      if (statusFilter === 'active') {
        query = query.in('status', ['open', 'on_hold'])
      } else if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id,
  })

  const filteredCases = useMemo(() => {
    return cases.filter((case_: any) => 
      case_.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [cases, searchTerm])

  // Placeholder functions for mutations
  const createCase = async (data: any) => {
    console.log('Creating case:', data)
    return { success: true }
  }

  const updateCase = async (id: string, data: any) => {
    console.log('Updating case:', id, data)
    return { success: true }
  }

  const deleteCase = async (id: string) => {
    console.log('Deleting case:', id)
    return { success: true }
  }

  const archiveCase = async (id: string) => {
    console.log('Archiving case:', id)
    return { success: true }
  }

  const createCaseReset = () => {
    console.log('Resetting create case state')
  }

  return {
    cases: filteredCases,
    filteredCases,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    practiceAreaFilter,
    setPracticeAreaFilter,
    solicitorFilter,
    setSolicitorFilter,
    createCase,
    updateCase,
    deleteCase,
    archiveCase,
    isCreating: false,
    isCreateSuccess: false,
    createCaseReset,
    isUpdating: false,
    isDeleting: false,
    isArchiving: false
  }
}

// Placeholder exports to avoid circular dependencies
export const useCasesQueries = () => ({ data: [], isLoading: false })
export const useCasesMutations = () => ({ mutate: () => {}, isLoading: false })
export const useCasesFilters = () => ({ filters: {}, setFilters: () => {} })

export type { Case, CreateCaseData, UpdateCaseData }
