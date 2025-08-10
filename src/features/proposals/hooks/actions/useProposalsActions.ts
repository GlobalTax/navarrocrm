import { useProposalsData } from '@/hooks/useProposalsData'
import { useCreateProposal } from '@/hooks/useCreateProposal'
import { useUpdateProposalStatus } from '@/hooks/useUpdateProposalStatus'

export const useProposalsActions = (onProposalWon?: (proposal: any) => void) => {
  const { proposals } = useProposalsData()
  const { createProposal, isCreating } = useCreateProposal()
  const { updateProposalStatus, isUpdating } = useUpdateProposalStatus(proposals, onProposalWon)

  return {
    createProposal,
    updateProposalStatus,
    isCreating,
    isUpdating,
    // Placeholders to maintain API surface; implement later
    updateProposal: () => {},
    deleteProposal: () => {},
    duplicateProposal: () => {}
  }
}