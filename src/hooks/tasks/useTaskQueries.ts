
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { TaskStats, TaskWithRelations } from './types'

export const useTaskQueries = () => {
  const { user } = useApp()

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks', user?.org_id],
    queryFn: async () => {
      console.log('🔄 Fetching tasks for org:', user?.org_id)
      
      if (!user?.org_id) {
        console.log('❌ No org_id available')
        return []
      }

      try {
        // Consulta completa con todas las relaciones
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select(`
            *,
            task_assignments!task_assignments_task_id_fkey(
              id,
              user_id,
              user:users!task_assignments_user_id_fkey(
                id,
                email,
                role
              )
            ),
            case:cases!tasks_case_id_fkey(
              id,
              title,
              matter_number
            ),
            contact:contacts!tasks_contact_id_fkey(
              id,
              name,
              email
            ),
            created_by_user:users!tasks_created_by_fkey(
              id,
              email
            )
          `)
          .eq('org_id', user.org_id)
          .order('created_at', { ascending: false })

        if (tasksError) {
          console.error('❌ Error fetching tasks:', tasksError)
          throw tasksError
        }

        console.log('✅ Tasks fetched:', tasksData?.length || 0)
        
        // Transform to match TaskWithRelations type
        return (tasksData || []) as unknown as TaskWithRelations[]

      } catch (error) {
        console.error('❌ Critical error in task query:', error)
        throw error
      }
    },
    enabled: !!user?.org_id,
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
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
        // Usar función de base de datos si existe, sino calcular manualmente
        const { data: statsResult, error: statsError } = await supabase
          .rpc('get_task_stats', { org_uuid: user.org_id })

        if (statsError) {
          console.error('❌ Error fetching task stats:', statsError)
          // Fallback: calcular estadísticas manualmente desde las tareas básicas
          return calculateStatsFromTasks(tasks)
        }

        const stats = Array.isArray(statsResult) ? statsResult[0] : statsResult
        console.log('✅ Task stats calculated:', stats)
        
        return stats || {
          total_tasks: 0,
          pending_tasks: 0,
          in_progress_tasks: 0,
          completed_tasks: 0,
          overdue_tasks: 0,
          high_priority_tasks: 0
        }
      } catch (error) {
        console.error('❌ Error in task stats query:', error)
        return calculateStatsFromTasks(tasks)
      }
    },
    enabled: !!user?.org_id,
    retry: 1,
    retryDelay: 500,
    staleTime: 60000,
  })

  return {
    tasks: Array.isArray(tasks) ? tasks : [],
    taskStats,
    isLoading,
    error,
  }
}

// Función auxiliar para calcular stats como fallback
function calculateStatsFromTasks(tasks: TaskWithRelations[]): TaskStats {
  if (!Array.isArray(tasks)) {
    return {
      total_tasks: 0,
      pending_tasks: 0,
      in_progress_tasks: 0,
      completed_tasks: 0,
      overdue_tasks: 0,
      high_priority_tasks: 0
    }
  }

  const now = new Date()
  
  return {
    total_tasks: tasks.length,
    pending_tasks: tasks.filter(t => t.status === 'pending').length,
    in_progress_tasks: tasks.filter(t => t.status === 'in_progress').length,
    completed_tasks: tasks.filter(t => t.status === 'completed').length,
    overdue_tasks: tasks.filter(t => 
      t.due_date && new Date(t.due_date) < now && t.status !== 'completed'
    ).length,
    high_priority_tasks: tasks.filter(t => 
      t.priority === 'high' || t.priority === 'urgent'
    ).length
  }
}
