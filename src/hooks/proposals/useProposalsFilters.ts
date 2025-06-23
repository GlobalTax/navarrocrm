
import { useState } from 'react'

export interface ProposalsFilters {
  status: string
  search: string
  dateFrom: Date | undefined
  dateTo: Date | undefined
}

export const useProposalsFilters = () => {
  const [filters, setFilters] = useState<ProposalsFilters>({
    status: '',
    search: '',
    dateFrom: undefined,
    dateTo: undefined
  })

  const filterProposals = (proposals: any[]) => {
    return proposals.filter(proposal => {
      if (filters.status && proposal.status !== filters.status) return false
      if (filters.search && !proposal.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !proposal.client?.name.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.dateFrom && new Date(proposal.created_at) < filters.dateFrom) return false
      if (filters.dateTo && new Date(proposal.created_at) > filters.dateTo) return false
      return true
    })
  }

  const categorizeProposals = (filteredProposals: any[]) => {
    const recurringProposals = filteredProposals.filter(p => p.is_recurring)
    const oneTimeProposals = filteredProposals.filter(p => !p.is_recurring)
    
    return {
      all: filteredProposals,
      recurring: recurringProposals,
      oneTime: oneTimeProposals
    }
  }

  return {
    filters,
    setFilters,
    filterProposals,
    categorizeProposals
  }
}
