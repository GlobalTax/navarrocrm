import { useProposalsData } from '@/hooks/useProposalsData'

export const useProposalsQueries = () => {
  const { proposals, isLoading, error, refetch } = useProposalsData()
  return {
    proposals: proposals || [],
    isLoading: isLoading || false,
    error: error || null,
    refetch
  }
}