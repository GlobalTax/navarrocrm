
import { useMemo, useCallback } from 'react'
import { useProposalsQueries, useProposalsActions, useSaveProposal } from '@/features/proposals'
import { useApp } from '@/contexts/AppContext'
import { useProposalsPageState } from '@/hooks/proposals/useProposalsPageState'
import { useProposalsFilters } from '@/hooks/proposals/useProposalsFilters'
import { useOptimizedClients } from '@/hooks/useOptimizedClients'


export const useProposalsPageLogic = (onProposalWon?: (proposal: any) => void) => {
  const { proposals, isLoading, error, refetch } = useProposalsQueries()
  const { createProposal, updateProposalStatus, isCreating } = useProposalsActions(onProposalWon)
  const { mutate: saveRecurrentProposal, isPending: isSavingRecurrent } = useSaveProposal()
  const { user } = useApp()
  const { clients } = useOptimizedClients()
  
  // Estados de la página
  const pageState = useProposalsPageState()
  const { filters, setFilters, filterProposals, categorizeProposals, getProposalMetrics } = useProposalsFilters()

  // Filtrar y categorizar propuestas con memoización para evitar recálculos
  const filteredProposals = useMemo(() => 
    filterProposals(proposals), 
    [proposals, filters, filterProposals]
  )
  
  const categorizedProposals = useMemo(() => 
    categorizeProposals(filteredProposals), 
    [filteredProposals, categorizeProposals]
  )
  
  const metrics = useMemo(() => 
    getProposalMetrics(filteredProposals), 
    [filteredProposals, getProposalMetrics]
  )

  return {
    // Data
    proposals,
    filteredProposals,
    categorizedProposals,
    metrics,
    clients,
    user,
    
    // Loading states
    isLoading,
    isCreating,
    isSavingRecurrent,
    
    // Error state
    error,
    
    // Page state
    pageState,
    
    // Filters
    filters,
    setFilters,
    
    // Mutations
    createProposal,
    updateProposalStatus,
    saveRecurrentProposal
  }
}
