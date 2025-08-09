import { useQuery } from '@tanstack/react-query'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { differenceInDays, isAfter, startOfMonth, format, subMonths } from 'date-fns'

interface Alert {
  id: string
  type: 'deadline' | 'payment' | 'overdue' | 'budget'
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  daysLeft?: number
  amount?: number
}

interface KPIMetric {
  title: string
  value: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'stable'
  }
  target?: {
    value: string
    percentage: number
  }
  type: 'revenue' | 'efficiency' | 'time'
}

interface EnhancedDashboardData {
  alerts: Alert[]
  executiveKPIs: KPIMetric[]
  revenueMetrics: {
    thisMonth: number
    lastMonth: number
    pendingInvoices: number
    collectionRate: number
  }
}

export const useEnhancedDashboard = () => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['enhanced-dashboard', user?.org_id],
    queryFn: async (): Promise<EnhancedDashboardData> => {
      if (!user?.org_id) throw new Error('No org_id')

      // Obtener datos en paralelo
      const [casesResult, timeEntriesResult, tasksResult] = await Promise.all([
        supabase
          .from('cases')
          .select('*')
          .eq('org_id', user.org_id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('time_entries')
          .select(`
            *,
            case:cases(title, contact:contacts(name))
          `)
          .eq('org_id', user.org_id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('tasks')
          .select('*')
          .eq('org_id', user.org_id)
          .order('due_date', { ascending: true })
      ])

      const cases = casesResult.data || []
      const timeEntries = timeEntriesResult.data || []
      const tasks = tasksResult.data || []

      // Generar alertas críticas
      const alerts = generateCriticalAlerts(cases, tasks, timeEntries)
      
      // Calcular KPIs ejecutivos
      const executiveKPIs = calculateExecutiveKPIs(timeEntries, cases)
      
      // Métricas de ingresos
      const revenueMetrics = calculateRevenueMetrics(timeEntries)

      return {
        alerts,
        executiveKPIs,
        revenueMetrics
      }
    },
    enabled: !!user?.org_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000 // 5 minutes
  })
}

const generateCriticalAlerts = (cases: any[], tasks: any[], timeEntries: any[]): Alert[] => {
  const alerts: Alert[] = []
  const now = new Date()

  // Alertas de plazos legales (casos con fecha límite próxima)
  cases.forEach(case_ => {
    if (case_.status === 'open' && case_.due_date) {
      const dueDate = new Date(case_.due_date)
      const daysLeft = differenceInDays(dueDate, now)
      
      if (daysLeft <= 7 && daysLeft >= 0) {
        alerts.push({
          id: `case-deadline-${case_.id}`,
          type: 'deadline',
          title: 'Plazo legal próximo',
          description: `Caso: ${case_.title || 'Sin título'}`,
          severity: daysLeft <= 3 ? 'high' : 'medium',
          daysLeft
        })
      } else if (daysLeft < 0) {
        alerts.push({
          id: `case-overdue-${case_.id}`,
          type: 'overdue',
          title: 'Caso vencido',
          description: `Caso: ${case_.title || 'Sin título'}`,
          severity: 'high',
          daysLeft
        })
      }
    }
  })

  // Alertas de tareas vencidas
  tasks.forEach(task => {
    if (task.status !== 'completed' && task.due_date) {
      const dueDate = new Date(task.due_date)
      const daysLeft = differenceInDays(dueDate, now)
      
      if (daysLeft < 0) {
        alerts.push({
          id: `task-overdue-${task.id}`,
          type: 'overdue',
          title: 'Tarea vencida',
          description: task.title || 'Sin título',
          severity: 'high',
          daysLeft
        })
      } else if (daysLeft <= 2) {
        alerts.push({
          id: `task-deadline-${task.id}`,
          type: 'deadline',
          title: 'Tarea por vencer',
          description: task.title || 'Sin título',
          severity: 'medium',
          daysLeft
        })
      }
    }
  })

  // Alerta de horas no facturadas acumuladas
  const unbilledHours = timeEntries
    .filter(entry => !entry.is_billable && entry.duration_minutes > 0)
    .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)

  if (unbilledHours > 40) { // Más de 40 horas no facturadas
    alerts.push({
      id: 'unbilled-hours',
      type: 'budget',
      title: 'Horas no facturadas acumuladas',
      description: `${Math.round(unbilledHours)}h sin facturar`,
      severity: 'medium'
    })
  }

  return alerts.sort((a, b) => {
    // Ordenar por severidad y luego por fecha
    const severityOrder = { high: 3, medium: 2, low: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })
}

const calculateExecutiveKPIs = (timeEntries: any[], cases: any[]): KPIMetric[] => {
  const now = new Date()
  const currentMonth = startOfMonth(now)
  const lastMonth = startOfMonth(subMonths(now, 1))
  
  // Horas facturables este mes
  const thisMonthBillable = timeEntries
    .filter(entry => entry.is_billable && new Date(entry.created_at) >= currentMonth)
    .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)
  
  // Horas facturables mes pasado
  const lastMonthBillable = timeEntries
    .filter(entry => 
      entry.is_billable && 
      new Date(entry.created_at) >= lastMonth && 
      new Date(entry.created_at) < currentMonth
    )
    .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)

  // Ingresos estimados (€50/hora)
  const HOURLY_RATE = 50
  const thisMonthRevenue = thisMonthBillable * HOURLY_RATE
  const lastMonthRevenue = lastMonthBillable * HOURLY_RATE
  
  // Tasa de utilización
  const totalHours = timeEntries
    .filter(entry => new Date(entry.created_at) >= currentMonth)
    .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)
  
  const utilizationRate = totalHours > 0 ? (thisMonthBillable / totalHours) * 100 : 0
  
  // Casos activos vs objetivo
  const activeCases = cases.filter(c => c.status === 'open').length
  const TARGET_CASES = 25

  const kpis: KPIMetric[] = [
    {
      title: 'Ingresos del Mes',
      value: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(thisMonthRevenue),
      trend: {
        value: lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0,
        direction: thisMonthRevenue > lastMonthRevenue ? 'up' : thisMonthRevenue < lastMonthRevenue ? 'down' : 'stable'
      },
      type: 'revenue'
    },
    {
      title: 'Tasa de Utilización',
      value: `${Math.round(utilizationRate)}%`,
      target: {
        value: '75%',
        percentage: Math.round((utilizationRate / 75) * 100)
      },
      type: 'efficiency'
    },
    {
      title: 'Casos Activos',
      value: activeCases.toString(),
      target: {
        value: TARGET_CASES.toString(),
        percentage: Math.round((activeCases / TARGET_CASES) * 100)
      },
      type: 'efficiency'
    },
    {
      title: 'Horas Facturables',
      value: `${Math.round(thisMonthBillable)}h`,
      trend: {
        value: lastMonthBillable > 0 ? Math.round(((thisMonthBillable - lastMonthBillable) / lastMonthBillable) * 100) : 0,
        direction: thisMonthBillable > lastMonthBillable ? 'up' : thisMonthBillable < lastMonthBillable ? 'down' : 'stable'
      },
      type: 'time'
    }
  ]

  return kpis
}

const calculateRevenueMetrics = (timeEntries: any[]) => {
  const now = new Date()
  const currentMonth = startOfMonth(now)
  const lastMonth = startOfMonth(subMonths(now, 1))
  const HOURLY_RATE = 50

  const thisMonthBillable = timeEntries
    .filter(entry => entry.is_billable && new Date(entry.created_at) >= currentMonth)
    .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)

  const lastMonthBillable = timeEntries
    .filter(entry => 
      entry.is_billable && 
      new Date(entry.created_at) >= lastMonth && 
      new Date(entry.created_at) < currentMonth
    )
    .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)

  return {
    thisMonth: thisMonthBillable * HOURLY_RATE,
    lastMonth: lastMonthBillable * HOURLY_RATE,
    pendingInvoices: 0, // Se podría calcular desde facturas pendientes
    collectionRate: 85 // Porcentaje estimado de cobro
  }
}