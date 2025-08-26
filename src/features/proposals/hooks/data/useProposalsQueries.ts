/**
 * Proposals data queries - optimized with proper caching and error handling
 */

import { useAuth } from '@/contexts/auth'
import { createQuery } from '@/lib/queries/base'
import { proposalsDAL } from '@/lib/dal'
import { useLogger } from '@/utils/logging'
import type { Proposal } from '@/lib/dal/proposals'

export const useProposalsQueries = () => {
  const { user } = useAuth()
  const logger = useLogger('ProposalsQueries')
  
  const orgId = user?.org_id
  
  const query = createQuery<Proposal[]>(
    ['proposals', orgId],
    async () => {
      if (!orgId) {
        throw new Error('Organization ID required')
      }
      
      logger.debug('Fetching proposals for org', { orgId })
      
      const response = await proposalsDAL.findMany({
        filters: { org_id: orgId },
        sort: [{ column: 'created_at', ascending: false }]
      })
      
      if (!response.success) {
        logger.error('Failed to fetch proposals', { error: response.error })
        throw response.error || new Error('Failed to fetch proposals')
      }
      
      logger.debug('Proposals fetched successfully', { count: response.data.length })
      return response.data
    },
    {
      enabled: !!orgId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false
    }
  )

  return {
    data: query.data || [],
    proposals: query.data || [], // Legacy compatibility
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}