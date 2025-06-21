
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { TaskStats } from './types'

export const useTaskQueries = () => {
  const { user } = useApp()

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', user?.org_id],
    queryFn: async () => {
      console.log('🔄 Fetching tasks for org:', user?.org_id)
      
      if (!user?.org_id) {
        console.log('❌ No org_id available')
        return []
      }

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_assignments:task_assignments(
            *,
            user:users(email, role)
          ),
          case:cases(title),
          client:clients(name),
          created_by_user:users!tasks_created_by_fkey(email)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching tasks:', error)
        throw error
      }
      
      console.log('✅ Tasks fetched:', data?.length || 0)
      return data || []
    },
    enabled: !!user?.org_id,
  })

  const { data: taskStats } = useQuery({
    queryKey: ['task-stats', user?.org_id],
    queryFn: async (): Promise<TaskStats> => {
      console.log('🔄 Fetching task stats for org:', user?.org_id)
      
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

      try {
        const { data, error } = await supabase.rpc('get_task_stats', {
          org_uuid: user.org_id
        })

        if (error) {
          console.error('❌ Error fetching task stats:', error)
          throw error
        }

        console.log('✅ Task stats fetched:', data)
        return data?.[0] || {
          total_tasks: 0,
          pending_tasks: 0,
          in_progress_tasks: 0,
          completed_tasks: 0,
          overdue_tasks: 0,
          high_priority_tasks: 0
        }
      } catch (err) {
        console.error('❌ Error in task stats query:', err)
        return {
          total_tasks: 0,
          pending_tasks: 0,
          in_progress_tasks: 0,
          completed_tasks: 0,
          overdue_tasks: 0,
          high_priority_tasks: 0
        }
      }
    },
    enabled: !!user?.org_id,
  })

  return {
    tasks,
    taskStats,
    isLoading,
    error,
  }
}
