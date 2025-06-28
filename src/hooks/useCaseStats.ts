
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

interface CaseStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  totalTimeHours: number
  billableTimeHours: number
  totalDocuments: number
  totalInvoiced: number
}

export const useCaseStats = (caseId: string | null) => {
  const { user } = useApp()

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['case-stats', caseId, user?.org_id],
    queryFn: async (): Promise<CaseStats> => {
      if (!caseId || !user?.org_id) {
        return {
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          totalTimeHours: 0,
          billableTimeHours: 0,
          totalDocuments: 0,
          totalInvoiced: 0
        }
      }

      // Obtener estadísticas de tareas
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('status')
        .eq('case_id', caseId)
        .eq('org_id', user.org_id)

      // Obtener estadísticas de tiempo
      const { data: timeData } = await supabase
        .from('time_entries')
        .select('duration_minutes, is_billable')
        .eq('case_id', caseId)
        .eq('org_id', user.org_id)

      // Obtener documentos (simulado por ahora)
      const totalDocuments = 0

      // Obtener facturación (simulado por ahora)
      const totalInvoiced = 0

      const totalTasks = tasksData?.length || 0
      const completedTasks = tasksData?.filter(t => t.status === 'completed').length || 0
      const pendingTasks = tasksData?.filter(t => t.status === 'pending').length || 0

      const totalTimeMinutes = timeData?.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) || 0
      const billableTimeMinutes = timeData?.filter(entry => entry.is_billable)
        .reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) || 0

      return {
        totalTasks,
        completedTasks,
        pendingTasks,
        totalTimeHours: Math.round((totalTimeMinutes / 60) * 100) / 100,
        billableTimeHours: Math.round((billableTimeMinutes / 60) * 100) / 100,
        totalDocuments,
        totalInvoiced
      }
    },
    enabled: !!caseId && !!user?.org_id,
  })

  return {
    stats: stats || {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      totalTimeHours: 0,
      billableTimeHours: 0,
      totalDocuments: 0,
      totalInvoiced: 0
    },
    isLoading,
    error
  }
}
