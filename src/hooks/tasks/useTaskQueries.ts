
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { TaskStats } from './types'

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
        // Consulta simplificada sin joins complejos que causan problemas
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('org_id', user.org_id)
          .order('created_at', { ascending: false })

        if (tasksError) {
          console.error('❌ Error fetching tasks:', tasksError)
          throw tasksError
        }

        console.log('✅ Tasks fetched:', tasksData?.length || 0)

        // Obtener datos relacionados por separado para evitar problemas de joins
        const tasksWithRelations = await Promise.all((tasksData || []).map(async (task) => {
          try {
            // Obtener asignaciones de usuario
            const { data: assignments } = await supabase
              .from('task_assignments')
              .select(`
                *,
                user:users!task_assignments_user_id_fkey(email, role)
              `)
              .eq('task_id', task.id)

            // Obtener caso relacionado si existe
            let caseData = null
            if (task.case_id) {
              const { data: caseResult } = await supabase
                .from('cases')
                .select('title')
                .eq('id', task.case_id)
                .single()
              caseData = caseResult
            }

            // Obtener contacto relacionado si existe
            let contactData = null
            if (task.contact_id) {
              const { data: contactResult } = await supabase
                .from('contacts')
                .select('name')
                .eq('id', task.contact_id)
                .single()
              contactData = contactResult
            }

            // Obtener usuario creador
            let createdByUser = null
            if (task.created_by) {
              const { data: userResult } = await supabase
                .from('users')
                .select('email')
                .eq('id', task.created_by)
                .single()
              createdByUser = userResult
            }

            // Obtener subtareas
            const { data: subtasks } = await supabase
              .from('task_subtasks')
              .select('*')
              .eq('task_id', task.id)
              .order('sort_order', { ascending: true })

            // Obtener comentarios
            const { data: comments } = await supabase
              .from('task_comments')
              .select(`
                *,
                user:users!task_comments_user_id_fkey(email)
              `)
              .eq('task_id', task.id)
              .order('created_at', { ascending: true })

            return {
              ...task,
              task_assignments: assignments || [],
              case: caseData,
              contact: contactData,
              created_by_user: createdByUser,
              subtasks: subtasks || [],
              comments: comments || []
            }
          } catch (relationError) {
            console.warn('⚠️ Error fetching task relations for task:', task.id, relationError)
            // Devolver la tarea sin relaciones en caso de error
            return {
              ...task,
              task_assignments: [],
              case: null,
              contact: null,
              created_by_user: null,
              subtasks: [],
              comments: []
            }
          }
        }))

        return tasksWithRelations
      } catch (error) {
        console.error('❌ Critical error in task query:', error)
        throw error
      }
    },
    enabled: !!user?.org_id,
    retry: 3,
    retryDelay: 1000,
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
        // Usar la función de base de datos para obtener estadísticas
        const { data: statsResult, error: statsError } = await supabase
          .rpc('get_task_stats', { org_uuid: user.org_id })

        if (statsError) {
          console.error('❌ Error fetching task stats:', statsError)
          throw statsError
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
        // Fallback: calcular estadísticas manualmente si la función falla
        return {
          total_tasks: tasks?.length || 0,
          pending_tasks: tasks?.filter(t => t.status === 'pending').length || 0,
          in_progress_tasks: tasks?.filter(t => 
            ['in_progress', 'investigation', 'drafting', 'review', 'filing', 'hearing'].includes(t.status)
          ).length || 0,
          completed_tasks: tasks?.filter(t => t.status === 'completed').length || 0,
          overdue_tasks: tasks?.filter(t => 
            t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
          ).length || 0,
          high_priority_tasks: tasks?.filter(t => 
            ['high', 'urgent', 'critical'].includes(t.priority)
          ).length || 0
        }
      }
    },
    enabled: !!user?.org_id,
    retry: 2,
    retryDelay: 500,
  })

  return {
    tasks: Array.isArray(tasks) ? tasks : [],
    taskStats,
    isLoading,
    error,
  }
}
