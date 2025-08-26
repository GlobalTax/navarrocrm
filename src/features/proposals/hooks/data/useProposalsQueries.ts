/**
 * Proposals data queries - standardized with new query system
 */

import { useAuth } from '@/contexts/auth'
import { createQuery } from '@/lib/queries/base'
import { proposalsDAL } from '@/lib/dal'
import type { Proposal } from '@/lib/dal/proposals'

export const useProposalsQueries = () => {
  const { user } = useAuth()
  
  const orgId = user?.org_id
  
  const query = createQuery<Proposal[]>(
    ['proposals', orgId],
    async () => {
      if (!orgId) {
        throw new Error('Organization ID required')
      }
      
      const response = await proposalsDAL.findMany({
        filters: { org_id: orgId },
        sort: [{ column: 'created_at', ascending: false }]
      })
      
      if (!response.success) {
        throw response.error || new Error('Failed to fetch proposals')
      }
      
      return response.data
    },
    {
      enabled: !!orgId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  return {
    proposals: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}