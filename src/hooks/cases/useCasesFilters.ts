
import { useState } from 'react'
import type { Case } from './types'

export const useCasesFilters = (cases: Case[]) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [practiceAreaFilter, setPracticeAreaFilter] = useState<string>('all')
  const [solicitorFilter, setSolicitorFilter] = useState<string>('all')

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
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
  }
}
