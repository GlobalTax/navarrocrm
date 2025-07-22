import { useState, useMemo } from 'react'
import { useDebounced } from '@/hooks/useDebounced'
import type { Case } from './types'

export const useCasesFilters = (cases: Case[]) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [practiceAreaFilter, setPracticeAreaFilter] = useState<string>('all')
  const [solicitorFilter, setSolicitorFilter] = useState<string>('all')

  // Debounce search term para mejorar rendimiento
  const debouncedSearchTerm = useDebounced(searchTerm, 500)

  // Filtros para server-side queries
  const serverFilters = useMemo(() => ({
    searchTerm: debouncedSearchTerm,
    statusFilter,
    practiceAreaFilter,
    solicitorFilter
  }), [debouncedSearchTerm, statusFilter, practiceAreaFilter, solicitorFilter])

  // Filtrado client-side optimizado
  const filteredCases = useMemo(() => {
    return cases.filter(case_ => {
      const matchesSearch = !debouncedSearchTerm || 
        case_.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        case_.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        case_.contact?.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        case_.matter_number?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && case_.status !== 'closed') ||
        (statusFilter === 'closed' && case_.status === 'closed') ||
        case_.status === statusFilter
        
      const matchesPracticeArea = practiceAreaFilter === 'all' || case_.practice_area === practiceAreaFilter
      const matchesSolicitor = solicitorFilter === 'all' || 
        case_.responsible_solicitor_id === solicitorFilter ||
        case_.originating_solicitor_id === solicitorFilter

      return matchesSearch && matchesStatus && matchesPracticeArea && matchesSolicitor
    })
  }, [cases, debouncedSearchTerm, statusFilter, practiceAreaFilter, solicitorFilter])

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('active')
    setPracticeAreaFilter('all')
    setSolicitorFilter('all')
  }

  return {
    filteredCases,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    practiceAreaFilter,
    setPracticeAreaFilter,
    solicitorFilter,
    setSolicitorFilter,
    serverFilters,
    clearFilters,
    hasActiveFilters: Boolean(
      debouncedSearchTerm || 
      statusFilter !== 'active' || 
      practiceAreaFilter !== 'all' || 
      solicitorFilter !== 'all'
    )
  }
}