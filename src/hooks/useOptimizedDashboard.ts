
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { startOfMonth, format, subMonths } from 'date-fns'

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

      // Execute all queries in parallel for better performance
      const [
        casesResult,
        contactsResult,
        timeEntriesResult,
        tasksResult
      ] = await Promise.all([
        // Cases with aggregation
        supabase
          .from('cases')
          .select('id, status, created_at'),
        
        // Contacts with count optimization
        supabase
          .from('contacts')
          .select('id, name, created_at')
          .order('created_at', { ascending: false }),
        
        // Time entries with aggregation potential
        supabase
          .from('time_entries')
          .select(`
            duration_minutes, 
            is_billable, 
            created_at, 
            user_id,
            description,
            case:cases(title, contact:contacts(name))
          `)
          .order('created_at', { ascending: false }),
        
        // Tasks for overdue calculation
        supabase
          .from('tasks')
          .select('id, title, due_date, status, completed_at')
          .order('completed_at', { ascending: false })
      ])

      // Process data efficiently
      const cases = casesResult.data || []
      const contacts = contactsResult.data || []
      const timeEntries = timeEntriesResult.data || []
      const tasks = tasksResult.data || []

      // Calculate stats in memory (more efficient than multiple queries)
      const now = new Date()
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const stats = {
        totalCases: cases.length,
        activeCases: cases.filter(c => c.status === 'open').length,
        totalContacts: contacts.length,
        totalTimeEntries: timeEntries.length,
        totalBillableHours: timeEntries
          .filter(t => t.is_billable)
          .reduce((sum, t) => sum + t.duration_minutes, 0) / 60,
        totalNonBillableHours: timeEntries
          .filter(t => !t.is_billable)
          .reduce((sum, t) => sum + t.duration_minutes, 0) / 60,
        thisMonthCases: cases.filter(c => new Date(c.created_at) >= currentMonth).length,
        thisMonthContacts: contacts.filter(c => new Date(c.created_at) >= currentMonth).length,
        thisMonthHours: timeEntries
          .filter(t => new Date(t.created_at) >= currentMonth)
          .reduce((sum, t) => sum + t.duration_minutes, 0) / 60
      }

      // Generate performance data for last 6 months
      const performanceData = []
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(now, i))
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
        
        const monthEntries = timeEntries.filter(entry => {
          const entryDate = new Date(entry.created_at)
          return entryDate >= monthStart && entryDate <= monthEnd
        })

        const totalHours = monthEntries.reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)
        const billableHours = monthEntries
          .filter(entry => entry.is_billable)
          .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)

        performanceData.push({
          month: format(monthStart, 'MMM'),
          horas: Math.round(totalHours),
          facturado: Math.round(billableHours),
          objetivo: 160
        })
      }

      // Generate recent activities efficiently
      const recentActivities = []
      
      // Add recent contacts (limit to avoid memory issues)
      contacts.slice(0, 3).forEach(contact => {
        recentActivities.push({
          id: `contact-${contact.id}`,
          type: 'client' as const,
          title: 'Nuevo contacto registrado',
          description: contact.name,
          timestamp: new Date(contact.created_at),
          user: 'Sistema'
        })
      })

      // Add recent cases
      cases.slice(0, 3).forEach(case_ => {
        recentActivities.push({
          id: `case-${case_.id}`,
          type: 'case' as const,
          title: 'Nuevo caso creado',
          description: case_.title || 'Sin título',
          timestamp: new Date(case_.created_at),
          user: 'Sistema'
        })
      })

      // Add recent time entries
      timeEntries.slice(0, 5).forEach(entry => {
        recentActivities.push({
          id: `time-${entry.id}`,
          type: 'time' as const,
          title: 'Tiempo registrado',
          description: `${Math.round(entry.duration_minutes / 60 * 10) / 10}h - ${entry.case?.title || 'Sin caso'}`,
          timestamp: new Date(entry.created_at),
          user: entry.user_id ? 'Usuario' : 'Sistema'
        })
      })

      // Add completed tasks
      tasks
        .filter(task => task.status === 'completed' && task.completed_at)
        .slice(0, 3)
        .forEach(task => {
          recentActivities.push({
            id: `task-${task.id}`,
            type: 'task' as const,
            title: 'Tarea completada',
            description: task.title,
            timestamp: new Date(task.completed_at),
            user: 'Usuario'
          })
        })

      // Sort and limit activities
      const sortedActivities = recentActivities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10)

      // Calculate quick stats
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todayEntries = timeEntries.filter(entry => new Date(entry.created_at) >= todayStart)
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const weekEntries = timeEntries.filter(entry => new Date(entry.created_at) >= weekStart)
      const monthEntries = timeEntries.filter(entry => new Date(entry.created_at) >= currentMonth)
      const overdueTasks = tasks.filter(task => 
        task.due_date && 
        new Date(task.due_date) < now && 
        task.status !== 'completed'
      )

      const quickStats = {
        todayHours: todayEntries.reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0),
        weekHours: weekEntries.reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0),
        monthHours: monthEntries.reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0),
        overdueItems: overdueTasks.length
      }

      const endTime = performance.now()
      console.log(`✅ [Performance] Dashboard data fetched in ${(endTime - startTime).toFixed(2)}ms`)

      return {
        stats,
        performanceData,
        recentActivities: sortedActivities,
        quickStats
      }
    },
    enabled: !!user?.org_id,
    staleTime: 2 * 60 * 1000, // 2 minutes - data stays fresh
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache
    refetchInterval: 5 * 60 * 1000, // Background refresh every 5 minutes
    refetchOnWindowFocus: false, // Prevent aggressive refetching
  })
}
