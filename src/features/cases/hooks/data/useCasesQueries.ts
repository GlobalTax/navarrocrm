/**
 * Cases data queries - standardized with new query system
 */

import { useAuth } from '@/contexts/auth'
import { createQuery } from '@/lib/queries/base'
import { casesDAL } from '@/lib/dal'
import type { Case } from '@/lib/dal/cases'

export const useCasesQueries = () => {
  const { user } = useAuth()
  
  const orgId = user?.org_id
  
  const query = createQuery<Case[]>(
    ['cases', orgId],
    async () => {
      if (!orgId) {
        throw new Error('Organization ID required')
      }
      
      const response = await casesDAL.findMany({
        filters: { org_id: orgId },
        sort: [{ column: 'created_at', ascending: false }]
      })
      
      if (!response.success) {
        throw response.error || new Error('Failed to fetch cases')
      }
      
      return response.data
    },
    {
      enabled: !!orgId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  return {
    cases: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}