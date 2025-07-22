
import { useQueries } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useMemo } from 'react'

export const useParallelQueries = () => {
  const { user } = useApp()

  // Queries paralelas optimizadas
  const queries = useQueries({
    queries: [
      // Query 1: Estadísticas de casos (solo campos necesarios)
      {
        queryKey: ['dashboard-cases', user?.org_id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('cases')
            .select('id, status, created_at, date_opened')
            .eq('org_id', user?.org_id!)
          if (error) throw error
          return data || []
        },
        enabled: !!user?.org_id,
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 10 * 60 * 1000 // 10 minutos
      },

      // Query 2: Estadísticas de contactos
      {
        queryKey: ['dashboard-contacts', user?.org_id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('contacts')
            .select('id, created_at, status')
            .eq('org_id', user?.org_id!)
          if (error) throw error
          return data || []
        },
        enabled: !!user?.org_id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000
      },

      // Query 3: Entradas de tiempo (optimizada)
      {
        queryKey: ['dashboard-time-entries', user?.org_id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('time_entries')
            .select('duration_minutes, is_billable, created_at')
            .eq('org_id', user?.org_id!)
            .order('created_at', { ascending: false })
            .limit(1000) // Limitar para performance
          if (error) throw error
          return data || []
        },
        enabled: !!user?.org_id,
        staleTime: 2 * 60 * 1000, // 2 minutos (más frecuente)
        gcTime: 5 * 60 * 1000
      },

      // Query 4: Tareas (solo campos críticos)
      {
        queryKey: ['dashboard-tasks', user?.org_id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('tasks')
            .select('id, status, due_date, priority, created_at')
            .eq('org_id', user?.org_id!)
          if (error) throw error
          return data || []
        },
        enabled: !!user?.org_id,
        staleTime: 3 * 60 * 1000,
        gcTime: 8 * 60 * 1000
      }
    ]
  })

  // Procesamiento memoizado de datos
  const processedData = useMemo(() => {
    const [casesQuery, contactsQuery, timeEntriesQuery, tasksQuery] = queries
    
    if (queries.some(q => q.isLoading)) {
      return { isLoading: true, data: null }
    }

    if (queries.some(q => q.error)) {
      return { 
        isLoading: false, 
        error: 'Error cargando datos del dashboard',
        data: null 
      }
    }

    const cases = casesQuery.data || []
    const contacts = contactsQuery.data || []
    const timeEntries = timeEntriesQuery.data || []
    const tasks = tasksQuery.data || []

    // Cálculos optimizados
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const stats = {
      totalCases: cases.length,
      activeCases: cases.filter(c => c.status === 'open').length,
      totalContacts: contacts.length,
      totalTimeEntries: timeEntries.length,
      totalBillableHours: timeEntries
        .filter(t => t.is_billable)
        .reduce((sum, t) => sum + (t.duration_minutes / 60), 0),
      totalNonBillableHours: timeEntries
        .filter(t => !t.is_billable)
        .reduce((sum, t) => sum + (t.duration_minutes / 60), 0),
      thisMonthCases: cases.filter(c => new Date(c.created_at) >= currentMonth).length,
      thisMonthContacts: contacts.filter(c => new Date(c.created_at) >= currentMonth).length,
      thisMonthHours: timeEntries
        .filter(t => new Date(t.created_at) >= currentMonth)
        .reduce((sum, t) => sum + (t.duration_minutes / 60), 0),
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      overdueTasks: tasks.filter(t => 
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
      ).length
    }

    return {
      isLoading: false,
      error: null,
      data: stats
    }
  }, [queries])

  // Función de refetch optimizada
  const refetchAll = async () => {
    await Promise.allSettled(queries.map(q => q.refetch()))
  }

  return {
    ...processedData,
    refetchAll,
    isFetching: queries.some(q => q.isFetching)
  }
}
