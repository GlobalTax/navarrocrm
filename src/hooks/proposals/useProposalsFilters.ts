
import { useState } from 'react'
import type { Proposal } from '@/types/proposals'

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

  const filterProposals = (proposals: Proposal[]) => {
    if (!proposals) return []
    
    return proposals.filter(proposal => {
      // Filtro por estado
      if (filters.status && filters.status !== 'all' && proposal.status !== filters.status) {
        return false
      }
      
      // Filtro por búsqueda (título, cliente, descripción)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const searchableText = [
          proposal.title?.toLowerCase() || '',
          proposal.client?.name?.toLowerCase() || '',
          proposal.description?.toLowerCase() || '',
          proposal.proposal_number?.toLowerCase() || ''
        ].join(' ')
        
        if (!searchableText.includes(searchTerm)) {
          return false
        }
      }
      
      // Filtro por fecha
      if (filters.dateFrom && new Date(proposal.created_at) < filters.dateFrom) {
        return false
      }
      if (filters.dateTo && new Date(proposal.created_at) > filters.dateTo) {
        return false
      }
      
      // Filtro por tipo - más preciso
      if (filters.type === 'recurring' && !proposal.is_recurring) {
        return false
      }
      if (filters.type === 'oneTime' && proposal.is_recurring) {
        return false
      }
      
      return true
    })
  }

  const categorizeProposals = (filteredProposals: Proposal[]) => {
    if (!filteredProposals) {
      return {
        all: [],
        recurring: [],
        oneTime: []
      }
    }
    
    const recurringProposals = filteredProposals.filter(p => p.is_recurring === true)
    const oneTimeProposals = filteredProposals.filter(p => p.is_recurring !== true)
    
    return {
      all: filteredProposals,
      recurring: recurringProposals,
      oneTime: oneTimeProposals
    }
  }

  const getProposalMetrics = (proposals: Proposal[]) => {
    if (!proposals) {
      return {
        total: 0,
        recurrent: 0,
        specific: 0,
        recurrentRevenue: 0,
        specificRevenue: 0,
        wonRecurrent: 0,
        wonSpecific: 0
      }
    }
    
    const recurrent = proposals.filter(p => p.is_recurring === true)
    const specific = proposals.filter(p => p.is_recurring !== true)
    
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
