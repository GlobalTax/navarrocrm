import { useProposals } from '@/hooks/useProposals'

export const useProposalsQueries = () => {
  const proposalsData = useProposals()
  return {
    proposals: proposalsData.proposals || [],
    isLoading: proposalsData.isLoading || false,
    error: proposalsData.error || null,
    refetch: () => {}
  }
}