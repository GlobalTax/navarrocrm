import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { startOfWeek, startOfMonth, subMonths, format } from 'date-fns'

export interface DashboardData {
  recentActivities: RecentActivity[]
  performanceData: PerformanceData[]
  quickStats: QuickStats
  timelineData: TimelineData[]
}

export interface RecentActivity {
  id: string
  type: 'client' | 'case' | 'time' | 'task' | 'proposal'
  title: string
  description: string
  timestamp: Date
  user: string
  metadata?: any
}

export interface PerformanceData {
  month: string
  horas: number
  facturado: number
  objetivo?: number
}

export interface QuickStats {
  todayHours: number
  weekHours: number
  monthHours: number
  overdueItems: number
}

export interface TimelineData {
  date: string
  events: number
  hours: number
}

export const useDashboardData = (dateRange: 'week' | 'month' | 'quarter' = 'month') => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['dashboard-data', user?.org_id, dateRange],
    queryFn: async () => {
      if (!user?.org_id) throw new Error('No org_id available')

      // Calcular fechas según el rango
      const now = new Date()
      const startDate = dateRange === 'week' ? startOfWeek(now) :
                       dateRange === 'month' ? startOfMonth(now) :
                       startOfMonth(subMonths(now, 3))

      // Obtener actividades recientes
      const recentActivities = await fetchRecentActivities(user.org_id)
      
      // Obtener datos de rendimiento mensual
      const performanceData = await fetchPerformanceData(user.org_id)
      
      // Obtener estadísticas rápidas
      const quickStats = await fetchQuickStats(user.org_id, startDate)
      
      // Obtener datos de timeline
      const timelineData = await fetchTimelineData(user.org_id, startDate)

      return {
        recentActivities,
        performanceData,
        quickStats,
        timelineData
      } as DashboardData
    },
    enabled: !!user?.org_id,
    refetchInterval: 30000 // Actualizar cada 30 segundos
  })
}

async function fetchRecentActivities(orgId: string): Promise<RecentActivity[]> {
  const activities: RecentActivity[] = []

  // Obtener clientes recientes
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, created_at, created_by:users!clients_created_by_fkey(email)')
    .order('created_at', { ascending: false })
    .limit(3)

  clients?.forEach(client => {
    activities.push({
      id: `client-${client.id}`,
      type: 'client',
      title: 'Nuevo cliente registrado',
      description: client.name,
      timestamp: new Date(client.created_at),
      user: client.created_by?.[0]?.email?.split('@')[0] || 'Sistema'
    })
  })

  // Obtener casos recientes
  const { data: cases } = await supabase
    .from('cases')
    .select(`
      id, title, created_at, 
      client:clients(name),
      created_by:users!cases_created_by_fkey(email)
    `)
    .order('created_at', { ascending: false })
    .limit(3)

  cases?.forEach(case_ => {
    activities.push({
      id: `case-${case_.id}`,
      type: 'case',
      title: 'Nuevo caso creado',
      description: `${case_.title} - ${case_.client?.name}`,
      timestamp: new Date(case_.created_at),
      user: case_.created_by?.[0]?.email?.split('@')[0] || 'Sistema'
    })
  })

  // Obtener entradas de tiempo recientes
  const { data: timeEntries } = await supabase
    .from('time_entries')
    .select(`
      id, description, duration_minutes, created_at,
      user:users!time_entries_user_id_fkey(email),
      case:cases(title, client:clients(name))
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  timeEntries?.forEach(entry => {
    activities.push({
      id: `time-${entry.id}`,
      type: 'time',
      title: 'Tiempo registrado',
      description: `${Math.round(entry.duration_minutes / 60 * 10) / 10}h - ${entry.case?.title || 'Sin caso'}`,
      timestamp: new Date(entry.created_at),
      user: entry.user?.email?.split('@')[0] || 'Usuario'
    })
  })

  // Obtener tareas completadas recientes
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      id, title, completed_at,
      created_by:users!tasks_created_by_fkey(email)
    `)
    .eq('status', 'completed')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(3)

  tasks?.forEach(task => {
    activities.push({
      id: `task-${task.id}`,
      type: 'task',
      title: 'Tarea completada',
      description: task.title,
      timestamp: new Date(task.completed_at),
      user: task.created_by?.[0]?.email?.split('@')[0] || 'Usuario'
    })
  })

  // Ordenar por timestamp y retornar los 10 más recientes
  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10)
}

async function fetchPerformanceData(orgId: string): Promise<PerformanceData[]> {
  const months = []
  const now = new Date()
  
  // Obtener datos de los últimos 6 meses
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i))
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
    
    const { data: timeEntries } = await supabase
      .from('time_entries')
      .select('duration_minutes, is_billable')
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString())

    const totalHours = timeEntries?.reduce((sum, entry) => 
      sum + (entry.duration_minutes / 60), 0) || 0
    
    const billableHours = timeEntries?.filter(entry => entry.is_billable)
      .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0) || 0

    months.push({
      month: format(monthStart, 'MMM'),
      horas: Math.round(totalHours),
      facturado: Math.round(billableHours),
      objetivo: 160 // Meta de 160 horas/mes
    })
  }
  
  return months
}

async function fetchQuickStats(orgId: string, startDate: Date): Promise<QuickStats> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = startOfWeek(now)
  const monthStart = startOfMonth(now)

  // Horas de hoy
  const { data: todayEntries } = await supabase
    .from('time_entries')
    .select('duration_minutes')
    .gte('created_at', todayStart.toISOString())

  const todayHours = todayEntries?.reduce((sum, entry) => 
    sum + (entry.duration_minutes / 60), 0) || 0

  // Horas de esta semana
  const { data: weekEntries } = await supabase
    .from('time_entries')
    .select('duration_minutes')
    .gte('created_at', weekStart.toISOString())

  const weekHours = weekEntries?.reduce((sum, entry) => 
    sum + (entry.duration_minutes / 60), 0) || 0

  // Horas de este mes
  const { data: monthEntries } = await supabase
    .from('time_entries')
    .select('duration_minutes')
    .gte('created_at', monthStart.toISOString())

  const monthHours = monthEntries?.reduce((sum, entry) => 
    sum + (entry.duration_minutes / 60), 0) || 0

  // Elementos vencidos (tareas + casos)
  const { data: overdueTasks } = await supabase
    .from('tasks')
    .select('id')
    .lt('due_date', now.toISOString())
    .neq('status', 'completed')

  return {
    todayHours: Math.round(todayHours * 10) / 10,
    weekHours: Math.round(weekHours * 10) / 10,
    monthHours: Math.round(monthHours * 10) / 10,
    overdueItems: overdueTasks?.length || 0
  }
}

async function fetchTimelineData(orgId: string, startDate: Date): Promise<TimelineData[]> {
  // Implementación simplificada - se puede expandir según necesidades
  return []
}
