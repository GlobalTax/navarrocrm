/**
 * Main proposals composite hook - optimized with better performance patterns
 */

import { useMemo, useCallback } from 'react'
import { useProposalsQueries } from './data/useProposalsQueries'
import { useProposalsActions } from './actions/useProposalsActions'
import { useProposalsFilters } from './ui/useProposalsFilters'
import { useProposalsPageState } from './ui/useProposalsPageState'
import { useOptimizedClients } from '@/hooks/useOptimizedClients'
import { useAuth } from '@/contexts/auth'
import { useLogger } from '@/utils/logging'

export const useProposalsList = (onProposalWon?: (proposal: any) => void) => {
  const logger = useLogger('ProposalsList')
  
  // Data layer
  const queries = useProposalsQueries()
  const actions = useProposalsActions(onProposalWon)
  const { clients } = useOptimizedClients()
  const { user } = useAuth()
  
  // UI layer
  const pageState = useProposalsPageState()
  const filters = useProposalsFilters()
  
  // Memoized filtered proposals with performance optimization
  const filteredProposals = useMemo(() => {
    if (!queries.data?.length) {
      logger.debug('No proposals to filter')
      return []
    }
    
    logger.debug('Filtering proposals', { 
      total: queries.data.length,
      hasFilters: filters.hasActiveFilters 
    })
    
    return filters.filterProposals(queries.data)
  }, [queries.data, filters.filterProposals, filters.hasActiveFilters, logger])
  
  // Memoized categorized proposals
  const categorizedProposals = useMemo(() => {
    if (!filteredProposals.length) {
      logger.debug('No filtered proposals to categorize')
      return { all: [], recurring: [], oneTime: [], draft: [], sent: [], won: [], lost: [] }
    }
    
    logger.debug('Categorizing proposals', { 
      filteredCount: filteredProposals.length 
    })
    
    return filters.categorizeProposals(filteredProposals)
  }, [filteredProposals, filters.categorizeProposals, logger])
  
  // Memoized metrics calculation
  const metrics = useMemo(() => {
    if (!filteredProposals.length) {
      logger.debug('No proposals for metrics calculation')
      return { total: 0, draft: 0, sent: 0, won: 0, lost: 0, totalValue: 0, wonValue: 0, conversionRate: 0 }
    }
    
    logger.debug('Calculating metrics', { 
      proposalCount: filteredProposals.length 
    })
    
    return filters.getProposalMetrics(filteredProposals)
  }, [filteredProposals, filters.getProposalMetrics, logger])

  // Optimized refetch function
  const refetch = useCallback(() => {
    logger.info('Manual refetch triggered')
    return queries.refetch()
  }, [queries.refetch, logger])

  return {
    // Data
    proposals: queries.data || [],
    filteredProposals,
    categorizedProposals,
    metrics,
    clients: clients || [],
    user,
    
    // Loading states
    isLoading: queries.isLoading,
    isError: queries.isError,
    error: queries.error,
    
    // Actions
    ...actions,
    refetch,
    
    // UI State
    pageState,
    
    // Filters
    filters: filters.filters,
    setFilters: filters.setFilters,
    clearFilters: filters.clearFilters,
    hasActiveFilters: filters.hasActiveFilters,
  }
}