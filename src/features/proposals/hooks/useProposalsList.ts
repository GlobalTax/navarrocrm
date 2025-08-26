/**
 * Main proposals composite hook - replaces ProposalsPageLogic
 */

import { useMemo } from 'react'
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
  
  // Computed values with memoization
  const filteredProposals = useMemo(() => {
    logger.debug('Filtering proposals', { 
      total: queries.proposals?.length || 0,
      hasFilters: filters.hasActiveFilters 
    })
    return filters.filterProposals(queries.proposals)
  }, [queries.proposals, filters, logger])
  
  const categorizedProposals = useMemo(() => {
    logger.debug('Categorizing proposals', { 
      filteredCount: filteredProposals.length 
    })
    return filters.categorizeProposals(filteredProposals)
  }, [filteredProposals, filters, logger])
  
  const metrics = useMemo(() => {
    logger.debug('Calculating metrics', { 
      proposalCount: filteredProposals.length 
    })
    return filters.getProposalMetrics(filteredProposals)
  }, [filteredProposals, filters, logger])

  return {
    // Data
    proposals: queries.proposals || [],
    filteredProposals,
    categorizedProposals,
    metrics,
    clients,
    user,
    
    // Loading states
    isLoading: queries.isLoading,
    isError: queries.error !== null,
    error: queries.error,
    
    // Actions
    ...actions,
    refetch: queries.refetch,
    
    // UI State
    pageState,
    
    // Filters
    filters: filters.filters,
    setFilters: filters.setFilters,
    clearFilters: filters.clearFilters,
    hasActiveFilters: filters.hasActiveFilters,
  }
}