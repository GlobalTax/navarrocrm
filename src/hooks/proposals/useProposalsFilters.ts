
import { useState } from 'react'

export interface ProposalsFilters {
  status: string
  search: string
  dateFrom: Date | undefined
  dateTo: Date | undefined
  type: string // 'all' | 'recurring' | 'oneTime'
}

export const useProposalsFilters = () => {
  const [filters, setFilters] = useState<ProposalsFilters>({
    status: 'all',
    search: '',
    dateFrom: undefined,
    dateTo: undefined,
    type: 'all'
  })

  const filterProposals = (proposals: any[]) => {
    return proposals.filter(proposal => {
      // Filtro por estado
      if (filters.status && filters.status !== 'all' && proposal.status !== filters.status) return false
      
      // Filtro por búsqueda (título o cliente)
      if (filters.search && 
          !proposal.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !proposal.client?.name?.toLowerCase().includes(filters.search.toLowerCase())) return false
      
      // Filtro por fecha
      if (filters.dateFrom && new Date(proposal.created_at) < filters.dateFrom) return false
      if (filters.dateTo && new Date(proposal.created_at) > filters.dateTo) return false
      
      // Filtro por tipo
      if (filters.type === 'recurring' && !proposal.is_recurring) return false
      if (filters.type === 'oneTime' && proposal.is_recurring) return false
      
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

  const getProposalMetrics = (proposals: any[]) => {
    const recurrent = proposals.filter(p => p.is_recurring)
    const specific = proposals.filter(p => !p.is_recurring)
    
    return {
      total: proposals.length,
      recurrent: recurrent.length,
      specific: specific.length,
      recurrentRevenue: recurrent.reduce((sum, p) => sum + (p.total_amount || 0), 0),
      specificRevenue: specific.reduce((sum, p) => sum + (p.total_amount || 0), 0),
      wonRecurrent: recurrent.filter(p => p.status === 'won').length,
      wonSpecific: specific.filter(p => p.status === 'won').length
    }
  }

  return {
    filters,
    setFilters,
    filterProposals,
    categorizeProposals,
    getProposalMetrics
  }
}
