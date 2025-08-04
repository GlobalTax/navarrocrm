
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { 
  calculateDashboardStatsOptimized, 
  calculatePerformanceDataOptimized, 
  calculateQuickStatsOptimized,
  generateRecentActivitiesOptimized,
  type SimpleCaseData,
  type SimpleContactData,
  type SimpleTimeEntry,
  type SimpleTaskData 
} from '@/lib/dashboard/calculationsOptimized'

export interface OptimizedDashboardData {
  stats: {
    totalCases: number
    activeCases: number
    totalContacts: number
    totalTimeEntries: number
    totalBillableHours: number
    totalNonBillableHours: number
    thisMonthCases: number
    thisMonthContacts: number
    thisMonthHours: number
  }
  performanceData: {
    month: string
    horas: number
    facturado: number
    objetivo: number
  }[]
  recentActivities: {
    id: string
    type: 'client' | 'case' | 'time' | 'task'
    title: string
    description: string
    timestamp: Date
    user: string
  }[]
  quickStats: {
    todayHours: number
    weekHours: number
    monthHours: number
    overdueItems: number
  }
}

// Removido - ahora se usa generateRecentActivitiesOptimized

export const useOptimizedDashboard = () => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['optimized-dashboard', user?.org_id],
    queryFn: async (): Promise<OptimizedDashboardData> => {
      if (!user?.org_id) {
        throw new Error('No org_id available')
      }

      const startTime = performance.now()

      // Execute all queries in parallel
      const [casesResult, contactsResult, timeEntriesResult, tasksResult] = await Promise.all([
        supabase
          .from('cases')
          .select('id, title, status, created_at')
          .eq('org_id', user.org_id),
        
        supabase
          .from('contacts')
          .select('id, name, created_at')
          .eq('org_id', user.org_id)
          .order('created_at', { ascending: false })
          .limit(50), // Limitar a 50 contactos recientes
        
        supabase
          .from('time_entries')
          .select('id, duration_minutes, is_billable, created_at, user_id, case_id')
          .eq('org_id', user.org_id)
          .order('created_at', { ascending: false })
          .limit(20), // Reducir a 20 entradas más recientes
        
        supabase
          .from('tasks')
          .select('id, title, due_date, status, completed_at')
          .eq('org_id', user.org_id)
          .order('completed_at', { ascending: false })
      ])

      // Validate results
      if (casesResult.error) throw new Error('Failed to fetch cases data')
      if (contactsResult.error) throw new Error('Failed to fetch contacts data')
      if (timeEntriesResult.error) throw new Error('Failed to fetch time entries data')
      if (tasksResult.error) throw new Error('Failed to fetch tasks data')

      const cases = casesResult.data || []
      const contacts = contactsResult.data || []
      const timeEntries = timeEntriesResult.data || []
      const tasks = tasksResult.data || []

      // Calculate all metrics using optimized functions
      const stats = calculateDashboardStatsOptimized(cases, contacts, timeEntries)
      const performanceData = calculatePerformanceDataOptimized(timeEntries)
      const quickStats = calculateQuickStatsOptimized(timeEntries, tasks)
      const recentActivities = generateRecentActivitiesOptimized(contacts, cases, timeEntries)

      if (import.meta.env.DEV) {
        const endTime = performance.now()
        console.log(`✅ [Performance] Dashboard data fetched in ${(endTime - startTime).toFixed(2)}ms`)
      }

      return {
        stats,
        performanceData,
        recentActivities,
        quickStats
      }
    },
    enabled: !!user?.org_id,
    staleTime: 1000 * 60 * 15, // 15 minutes - cache más largo
    gcTime: 1000 * 60 * 30, // 30 minutes  
    refetchInterval: 1000 * 60 * 30, // 30 minutes - refetch menos frecuente
    refetchOnWindowFocus: false,
  })
}
