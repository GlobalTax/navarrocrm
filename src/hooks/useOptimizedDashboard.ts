
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { 
  calculateDashboardStats, 
  calculatePerformanceData, 
  calculateQuickStats,
  type CaseData,
  type ContactData,
  type TimeEntryData,
  type TaskData 
} from '@/lib/dashboard/calculations'

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

const generateRecentActivities = (
  contacts: ContactData[],
  cases: CaseData[],
  timeEntries: TimeEntryData[],
  tasks: TaskData[]
) => {
  const recentActivities = []
  
  // Add recent contacts
  contacts.slice(0, 3).forEach(contact => {
    if (contact?.id && contact?.name && contact?.created_at) {
      recentActivities.push({
        id: `contact-${contact.id}`,
        type: 'client' as const,
        title: 'Nuevo contacto registrado',
        description: contact.name,
        timestamp: new Date(contact.created_at),
        user: 'Sistema'
      })
    }
  })

  // Add recent cases
  cases.slice(0, 3).forEach(case_ => {
    if (case_?.id && case_?.created_at) {
      recentActivities.push({
        id: `case-${case_.id}`,
        type: 'case' as const,
        title: 'Nuevo caso creado',
        description: case_.title || 'Sin título',
        timestamp: new Date(case_.created_at),
        user: 'Sistema'
      })
    }
  })

  // Add recent time entries
  timeEntries.slice(0, 5).forEach(entry => {
    if (entry?.id && entry?.created_at) {
      const duration = entry.duration_minutes ? Math.round(entry.duration_minutes / 60 * 10) / 10 : 0
      const caseTitle = entry.case?.title || 'Sin caso'
      
      recentActivities.push({
        id: `time-${entry.id}`,
        type: 'time' as const,
        title: 'Tiempo registrado',
        description: `${duration}h - ${caseTitle}`,
        timestamp: new Date(entry.created_at),
        user: entry.user_id ? 'Usuario' : 'Sistema'
      })
    }
  })

  // Add completed tasks
  tasks
    .filter(task => task?.status === 'completed' && task?.completed_at)
    .slice(0, 3)
    .forEach(task => {
      if (task?.id && task?.completed_at && task?.title) {
        recentActivities.push({
          id: `task-${task.id}`,
          type: 'task' as const,
          title: 'Tarea completada',
          description: task.title,
          timestamp: new Date(task.completed_at),
          user: 'Usuario'
        })
      }
    })

  return recentActivities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10)
}

export const useOptimizedDashboard = () => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['optimized-dashboard', user?.org_id],
    queryFn: async (): Promise<OptimizedDashboardData> => {
      if (!user?.org_id) {
        throw new Error('No org_id available')
      }

      console.log('🚀 [Performance] Starting optimized dashboard fetch for org:', user.org_id)
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
          .select(`
            id,
            duration_minutes, 
            is_billable, 
            created_at, 
            user_id,
            description,
            case:cases(title, contact:contacts(name))
          `)
          .eq('org_id', user.org_id)
          .order('created_at', { ascending: false }),
        
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

      // Calculate all metrics using utility functions
      const stats = calculateDashboardStats(cases, contacts, timeEntries)
      const performanceData = calculatePerformanceData(timeEntries)
      const quickStats = calculateQuickStats(timeEntries, tasks)
      const recentActivities = generateRecentActivities(contacts, cases, timeEntries, tasks)

      const endTime = performance.now()
      console.log(`✅ [Performance] Dashboard data fetched in ${(endTime - startTime).toFixed(2)}ms`)

      return {
        stats,
        performanceData,
        recentActivities,
        quickStats
      }
    },
    enabled: !!user?.org_id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}
