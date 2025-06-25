
import { useCachedQuery } from '@/hooks/cache'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { TaskStats } from './types'

export const useTaskQueriesWithCache = () => {
  const { user } = useApp()

  // Cache tasks with 2-minute TTL (tasks change frequently)
  const { data: tasks = [], isLoading, error } = useCachedQuery({
    queryKey: ['tasks', user?.org_id || ''],
    queryFn: async () => {
      console.log('🔄 Fetching tasks from API (cache miss)')
      
      if (!user?.org_id) {
        console.log('❌ No org_id available')
        return []
      }

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_assignments:task_assignments!task_assignments_task_id_fkey(
            *,
            user:users!task_assignments_user_id_fkey(email, role)
          ),
          case:cases!tasks_case_id_fkey(title),
          created_by_user:users!tasks_created_by_fkey(email),
          subtasks:task_subtasks(*),
          comments:task_comments(
            *,
            user:users!task_comments_user_id_fkey(email)
          )
        `)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching tasks:', error)
        throw error
      }
      
      console.log('✅ Tasks fetched from API:', data?.length || 0)
      return data || []
    },
    cacheTTL: 2 * 60 * 1000, // 2 minutos
    reactQueryOptions: {
      enabled: !!user?.org_id,
    }
  })

  // Cache task stats with longer TTL (5 minutes)
  const { data: taskStats } = useCachedQuery({
    queryKey: ['task-stats', user?.org_id || ''],
    queryFn: async (): Promise<TaskStats> => {
      console.log('🔄 Fetching task stats from API (cache miss)')
      
      if (!user?.org_id) {
        console.log('❌ No org_id available for stats')
        return {
          total_tasks: 0,
          pending_tasks: 0,
          in_progress_tasks: 0,
          completed_tasks: 0,
          overdue_tasks: 0,
          high_priority_tasks: 0
        }
      }

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('status, priority, due_date')
        .eq('org_id', user.org_id)

      if (error) {
        console.error('❌ Error fetching tasks for stats:', error)
        throw error
      }

      const now = new Date()
      const stats = {
        total_tasks: tasks?.length || 0,
        pending_tasks: tasks?.filter(t => t.status === 'pending').length || 0,
        in_progress_tasks: tasks?.filter(t => 
          ['in_progress', 'investigation', 'drafting', 'review', 'filing', 'hearing'].includes(t.status)
        ).length || 0,
        completed_tasks: tasks?.filter(t => t.status === 'completed').length || 0,
        overdue_tasks: tasks?.filter(t => 
          t.due_date && new Date(t.due_date) < now && t.status !== 'completed'
        ).length || 0,
        high_priority_tasks: tasks?.filter(t => 
          ['high', 'urgent', 'critical'].includes(t.priority)
        ).length || 0
      }

      console.log('✅ Task stats calculated from API:', stats)
      return stats
    },
    cacheTTL: 5 * 60 * 1000, // 5 minutos
    reactQueryOptions: {
      enabled: !!user?.org_id,
    }
  })

  return {
    tasks: Array.isArray(tasks) ? tasks : [],
    taskStats,
    isLoading,
    error,
  }
}
