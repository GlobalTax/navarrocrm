/**
 * Proposals UI filters and business logic separation
 */

import { useState, useMemo, useCallback } from 'react'
import { useLogger } from '@/utils/logging'
import type { Proposal } from '@/lib/dal/proposals'

interface ProposalFilters {
  status: string
  search: string
  contactId: string
  dateRange: {
    from?: Date
    to?: Date
  }
  // Legacy properties for backward compatibility
  type?: string
  dateFrom?: Date
  dateTo?: Date
}

interface ProposalMetrics {
  total: number
  draft: number
  sent: number
  won: number
  lost: number
  totalValue: number
  wonValue: number
  conversionRate: number
}

interface CategorizedProposals {
  draft: Proposal[]
  sent: Proposal[]
  won: Proposal[]
  lost: Proposal[]
  // Legacy properties for backward compatibility
  all: Proposal[]
  oneTime: Proposal[]
  recurring: Proposal[]
}

export const useProposalsFilters = () => {
  const logger = useLogger('ProposalsFilters')
  
  const [filters, setFilters] = useState<ProposalFilters>({
    status: 'all',
    search: '',
    contactId: 'all',
    dateRange: {},
    // Legacy defaults
    type: 'all',
  })

  const filterProposals = useCallback((proposals: Proposal[] | undefined): Proposal[] => {
    if (!proposals) return []

    logger.debug('Filtering proposals', { 
      totalProposals: proposals.length, 
      filters 
    })

    return proposals.filter(proposal => {
      // Status filter
      if (filters.status !== 'all' && proposal.status !== filters.status) {
        return false
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesTitle = proposal.title?.toLowerCase().includes(searchLower)
        const matchesDescription = proposal.description?.toLowerCase().includes(searchLower)
        
        if (!matchesTitle && !matchesDescription) {
          return false
        }
      }

      // Contact filter
      if (filters.contactId !== 'all' && proposal.contact_id !== filters.contactId) {
        return false
      }

      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const proposalDate = new Date(proposal.created_at)
        
        if (filters.dateRange.from && proposalDate < filters.dateRange.from) {
          return false
        }
        
        if (filters.dateRange.to && proposalDate > filters.dateRange.to) {
          return false
        }
      }

      return true
    })
  }, [filters, logger])

  const categorizeProposals = useCallback((proposals: Proposal[]): CategorizedProposals => {
    logger.debug('Categorizing proposals', { count: proposals.length })
    
    const categorized = proposals.reduce((acc, proposal) => {
      const status = proposal.status || 'draft'
      if (acc[status as keyof CategorizedProposals]) {
        acc[status as keyof CategorizedProposals].push(proposal)
      }
      return acc
    }, {
      draft: [] as Proposal[],
      sent: [] as Proposal[],
      won: [] as Proposal[],
      lost: [] as Proposal[]
    })

    // Add legacy properties
    return {
      ...categorized,
      all: proposals,
      oneTime: proposals.filter(p => !(p as any).is_recurring),
      recurring: proposals.filter(p => (p as any).is_recurring)
    }
  }, [logger])

  const getProposalMetrics = useCallback((proposals: Proposal[]): ProposalMetrics => {
    logger.debug('Calculating proposal metrics', { count: proposals.length })
    
    const metrics = proposals.reduce((acc, proposal) => {
      const amount = proposal.total_amount || 0
      
      acc.total += 1
      acc.totalValue += amount
      
      switch (proposal.status) {
        case 'draft':
          acc.draft += 1
          break
        case 'sent':
          acc.sent += 1
          break
        case 'won':
          acc.won += 1
          acc.wonValue += amount
          break
        case 'lost':
          acc.lost += 1
          break
      }
      
      return acc
    }, {
      total: 0,
      draft: 0,
      sent: 0,
      won: 0,
      lost: 0,
      totalValue: 0,
      wonValue: 0,
      conversionRate: 0
    })

    // Calculate conversion rate
    const totalNonDraft = metrics.sent + metrics.won + metrics.lost
    metrics.conversionRate = totalNonDraft > 0 ? (metrics.won / totalNonDraft) * 100 : 0

    return metrics
  }, [logger])

  const clearFilters = useCallback(() => {
    logger.info('Clearing all filters')
    setFilters({
      status: 'all',
      search: '',
      contactId: 'all',
      dateRange: {},
      type: 'all'
    })
  }, [logger])

  const hasActiveFilters = useMemo(() => {
    return filters.status !== 'all' || 
           filters.search !== '' || 
           filters.contactId !== 'all' ||
           filters.dateRange.from !== undefined ||
           filters.dateRange.to !== undefined
  }, [filters])

  return {
    filters,
    setFilters,
    filterProposals,
    categorizeProposals,
    getProposalMetrics,
    clearFilters,
    hasActiveFilters
  }
}