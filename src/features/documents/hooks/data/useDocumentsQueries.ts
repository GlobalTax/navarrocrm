/**
 * Documents data queries - standardized with new query system
 */

import { useAuth } from '@/contexts/auth'
import { createQuery } from '@/lib/queries/base'
import { documentsDAL } from '@/lib/dal'
import type { Document } from '@/lib/dal/documents'

export const useDocumentsQueries = () => {
  const { user } = useAuth()
  
  const orgId = user?.org_id
  
  const query = createQuery<Document[]>(
    ['documents', orgId],
    async () => {
      if (!orgId) {
        throw new Error('Organization ID required')
      }
      
      const response = await documentsDAL.findMany({
        filters: { org_id: orgId },
        sort: [{ column: 'created_at', ascending: false }]
      })
      
      if (!response.success) {
        throw response.error || new Error('Failed to fetch documents')
      }
      
      return response.data
    },
    {
      enabled: !!orgId,
      staleTime: 10 * 60 * 1000, // 10 minutes (documents change less frequently)
    }
  )

  return {
    documents: query.data || [],
    templates: [], // Placeholder for now
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}