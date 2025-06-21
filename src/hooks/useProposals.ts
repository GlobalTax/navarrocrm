
import { useProposalsData } from './useProposalsData'
import { useCreateProposal } from './useCreateProposal'
import { useUpdateProposalStatus } from './useUpdateProposalStatus'

export * from '@/types/proposals'

export const useProposals = () => {
  const { proposals, isLoading, error } = useProposalsData()
  const { createProposal, isCreating } = useCreateProposal()
  const { updateProposalStatus, isUpdating } = useUpdateProposalStatus(proposals)

  return {
    proposals,
    isLoading,
    error,
    createProposal,
    updateProposalStatus,
    isCreating,
    isUpdating
  }
}
