
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface TimelineEvent {
  id: string
  type: 'task_created' | 'task_completed' | 'time_logged' | 'case_updated' | 'note_added'
  title: string
  description: string
  timestamp: string
  user_name?: string
  icon: string
  color: string
}

export const useCaseTimeline = (caseId: string | null) => {
  const { user } = useApp()

  const { data: timeline = [], isLoading, error } = useQuery({
    queryKey: ['case-timeline', caseId, user?.org_id],
    queryFn: async (): Promise<TimelineEvent[]> => {
      if (!caseId || !user?.org_id) return []

      const events: TimelineEvent[] = []

      // Obtener eventos de tareas
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          id, title, status, created_at, updated_at,
          created_by_user:users!tasks_created_by_fkey(email)
        `)
        .eq('case_id', caseId)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      tasks?.forEach(task => {
        // Evento de creación de tarea
        events.push({
          id: `task-created-${task.id}`,
          type: 'task_created',
          title: 'Tarea creada',
          description: `Se creó la tarea: ${task.title}`,
          timestamp: task.created_at,
          user_name: task.created_by_user?.email,
          icon: 'Plus',
          color: 'text-blue-600'
        })

        // Evento de completado si está completada
        if (task.status === 'completed' && task.updated_at !== task.created_at) {
          events.push({
            id: `task-completed-${task.id}`,
            type: 'task_completed',
            title: 'Tarea completada',
            description: `Se completó la tarea: ${task.title}`,
            timestamp: task.updated_at,
            icon: 'CheckCircle',
            color: 'text-green-600'
          })
        }
      })

      // Obtener eventos de tiempo registrado
      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select(`
          id, description, duration_minutes, is_billable, created_at,
          user:users!time_entries_user_id_fkey(email)
        `)
        .eq('case_id', caseId)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })
        .limit(10)

      timeEntries?.forEach(entry => {
        const hours = Math.round((entry.duration_minutes / 60) * 100) / 100
        events.push({
          id: `time-${entry.id}`,
          type: 'time_logged',
          title: 'Tiempo registrado',
          description: `${hours}h ${entry.is_billable ? '(Facturable)' : '(No facturable)'} - ${entry.description || 'Sin descripción'}`,
          timestamp: entry.created_at,
          user_name: entry.user?.email,
          icon: 'Clock',
          color: entry.is_billable ? 'text-green-600' : 'text-gray-600'
        })
      })

      // Ordenar eventos por fecha (más recientes primero)
      return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    },
    enabled: !!caseId && !!user?.org_id,
  })

  return {
    timeline,
    isLoading,
    error
  }
}
