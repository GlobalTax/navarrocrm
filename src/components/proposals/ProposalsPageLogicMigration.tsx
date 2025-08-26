/**
 * Migration wrapper for ProposalsPageLogic
 * This maintains backward compatibility while transitioning to new hooks
 */

import { useProposalsList } from '@/features/proposals'

export const useProposalsPageLogic = (onProposalWon?: (proposal: any) => void) => {
  // Use the new standardized hook
  const result = useProposalsList(onProposalWon)
  
  // Map to old interface for backward compatibility
  return {
    // Data - keep old property names
    proposals: result.proposals,
    filteredProposals: result.filteredProposals,
    categorizedProposals: result.categorizedProposals,
    metrics: result.metrics,
    clients: result.clients || [],
    user: result.user,
    
    // Loading states
    isLoading: result.isLoading,
    isCreating: result.isCreating,
    isSavingRecurrent: false, // Legacy placeholder
    
    // Error state
    error: result.error,
    
    // Page state - provide defaults
    pageState: result.pageState,
    
    // Filters
    filters: result.filters,
    setFilters: result.setFilters,
    
    // Mutations
    createProposal: result.createProposal,
    updateProposalStatus: result.updateProposalStatus,
    saveRecurrentProposal: () => {} // Legacy placeholder
  }
}
