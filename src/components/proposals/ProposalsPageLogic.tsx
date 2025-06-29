
import { useProposals } from '@/hooks/useProposals'
import { useSaveProposal } from '@/modules/proposals/hooks/useSaveProposal'
import { useApp } from '@/contexts/AppContext'
import { useProposalsPageState } from '@/hooks/proposals/useProposalsPageState'
import { useProposalsFilters } from '@/hooks/proposals/useProposalsFilters'
import { useClients } from '@/hooks/useClients'
import { ProposalFormData } from '@/modules/proposals/types/proposal.schema'

export const useProposalsPageLogic = () => {
  const { proposals, isLoading, createProposal, updateProposalStatus, isCreating } = useProposals()
  const { mutate: saveRecurrentProposal, isPending: isSavingRecurrent } = useSaveProposal()
  const { user } = useApp()
  const { clients } = useClients()
  
  // Estados de la página
  const pageState = useProposalsPageState()
  const { filters, setFilters, filterProposals, categorizeProposals, getProposalMetrics } = useProposalsFilters()

  // Filtrar y categorizar propuestas
  const filteredProposals = filterProposals(proposals)
  const categorizedProposals = categorizeProposals(filteredProposals)
  const metrics = getProposalMetrics(filteredProposals)

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
