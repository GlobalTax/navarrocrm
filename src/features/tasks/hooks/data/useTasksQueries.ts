/**
 * Tasks data queries - standardized with new query system
 */

import { useAuth } from '@/contexts/auth'
import { createQuery } from '@/lib/queries/base'
import { tasksDAL } from '@/lib/dal'
import type { Task } from '@/lib/dal/tasks'

export const useTasksQueries = () => {
  const { user } = useAuth()
  
  const orgId = user?.org_id
  
  const query = createQuery<Task[]>(
    ['tasks', orgId],
    async () => {
      if (!orgId) {
        throw new Error('Organization ID required')
      }
      
      const response = await tasksDAL.findMany({
        filters: { org_id: orgId },
        sort: [{ column: 'created_at', ascending: false }]
      })
      
      if (!response.success) {
        throw response.error || new Error('Failed to fetch tasks')
      }
      
      return response.data
    },
    {
      enabled: !!orgId,
      staleTime: 2 * 60 * 1000, // 2 minutes (tasks change more frequently)
    }
  )

  return {
    tasks: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}