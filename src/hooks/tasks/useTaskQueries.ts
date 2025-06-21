
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
          task_assignments:task_assignments!task_assignments_task_id_fkey(
            *,
            user:users!task_assignments_user_id_fkey(email, role)
          ),
          case:cases!tasks_case_id_fkey(title),
          client:clients!tasks_client_id_fkey(name),
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
        console.log('🔄 Calling get_task_stats RPC function...')
        const { data, error } = await supabase.rpc('get_task_stats', {
          org_uuid: user.org_id
        })

        if (error) {
          console.error('❌ Error fetching task stats:', error)
          console.error('❌ Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          
          // Si la función no existe o hay problemas de RLS, calcular las estadísticas manualmente
          if (error.code === '42883' || error.code === '42501' || error.message?.includes('does not exist')) {
            console.log('⚠️ RPC function issue, calculating manually...')
            return await calculateTaskStatsManually(user.org_id)
          }
          
          throw error
        }

        console.log('✅ Task stats fetched via RPC:', data)
        const result = Array.isArray(data) ? data[0] : data
        return result || {
          total_tasks: 0,
          pending_tasks: 0,
          in_progress_tasks: 0,
          completed_tasks: 0,
          overdue_tasks: 0,
          high_priority_tasks: 0
        }
      } catch (err) {
        console.error('❌ Error in task stats query:', err)
        
        // Fallback: calcular estadísticas manualmente
        console.log('⚠️ Fallback: calculating task stats manually...')
        return await calculateTaskStatsManually(user.org_id)
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

// Función auxiliar para calcular estadísticas manualmente
async function calculateTaskStatsManually(orgId: string): Promise<TaskStats> {
  try {
    console.log('🔄 Calculating task stats manually for org:', orgId)
    
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('status, priority, due_date')
      .eq('org_id', orgId)

    if (error) {
      console.error('❌ Error fetching tasks for manual calculation:', error)
      throw error
    }

    const now = new Date()
    const stats = {
      total_tasks: tasks?.length || 0,
      pending_tasks: tasks?.filter(t => t.status === 'pending').length || 0,
      in_progress_tasks: tasks?.filter(t => t.status === 'in_progress').length || 0,
      completed_tasks: tasks?.filter(t => t.status === 'completed').length || 0,
      overdue_tasks: tasks?.filter(t => 
        t.due_date && new Date(t.due_date) < now && t.status !== 'completed'
      ).length || 0,
      high_priority_tasks: tasks?.filter(t => 
        t.priority === 'high' || t.priority === 'urgent'
      ).length || 0
    }

    console.log('✅ Manual task stats calculated:', stats)
    return stats
  } catch (err) {
    console.error('❌ Error calculating task stats manually:', err)
    return {
      total_tasks: 0,
      pending_tasks: 0,
      in_progress_tasks: 0,
      completed_tasks: 0,
      overdue_tasks: 0,
      high_priority_tasks: 0
    }
  }
}
