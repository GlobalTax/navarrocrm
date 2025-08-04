/**
 * Cálculos optimizados del dashboard sin joins pesados
 * Versión simplificada para mejor rendimiento
 */

export interface SimpleTimeEntry {
  id: string
  duration_minutes: number | null
  is_billable: boolean | null
  created_at: string
  user_id: string | null
  case_id: string | null
}

export interface SimpleCaseData {
  id: string
  title: string | null
  status: string | null
  created_at: string
}

export interface SimpleContactData {
  id: string
  name: string
  created_at: string
}

export interface SimpleTaskData {
  id: string
  title: string | null
  due_date: string | null
  status: string | null
  completed_at: string | null
}

export const calculateDashboardStatsOptimized = (
  cases: SimpleCaseData[],
  contacts: SimpleContactData[],
  timeEntries: SimpleTimeEntry[]
) => {
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  // Estadísticas básicas sin joins
  const totalCases = cases.length
  const activeCases = cases.filter(c => c.status !== 'closed').length
  const totalContacts = contacts.length
  const totalTimeEntries = timeEntries.length

  // Cálculo optimizado de horas
  let totalBillableHours = 0
  let totalNonBillableHours = 0
  let thisMonthHours = 0

  timeEntries.forEach(entry => {
    const duration = (entry.duration_minutes || 0) / 60
    const entryDate = new Date(entry.created_at)
    
    if (entry.is_billable) {
      totalBillableHours += duration
    } else {
      totalNonBillableHours += duration
    }
    
    if (entryDate >= thisMonth) {
      thisMonthHours += duration
    }
  })

  // Casos y contactos de este mes
  const thisMonthCases = cases.filter(c => new Date(c.created_at) >= thisMonth).length
  const thisMonthContacts = contacts.filter(c => new Date(c.created_at) >= thisMonth).length

  return {
    totalCases,
    activeCases,
    totalContacts,
    totalTimeEntries,
    totalBillableHours: Math.round(totalBillableHours * 10) / 10,
    totalNonBillableHours: Math.round(totalNonBillableHours * 10) / 10,
    thisMonthCases,
    thisMonthContacts,
    thisMonthHours: Math.round(thisMonthHours * 10) / 10,
  }
}

export const calculateQuickStatsOptimized = (
  timeEntries: SimpleTimeEntry[],
  tasks: SimpleTaskData[]
) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  let todayHours = 0
  let weekHours = 0
  let monthHours = 0

  timeEntries.forEach(entry => {
    const entryDate = new Date(entry.created_at)
    const duration = (entry.duration_minutes || 0) / 60

    if (entryDate >= today) {
      todayHours += duration
    }
    if (entryDate >= weekAgo) {
      weekHours += duration
    }
    monthHours += duration // Ya están filtradas del mes actual
  })

  // Tareas vencidas (simplificado)
  const overdueItems = tasks.filter(task => {
    if (!task.due_date || task.status === 'completed') return false
    return new Date(task.due_date) < now
  }).length

  return {
    todayHours: Math.round(todayHours * 10) / 10,
    weekHours: Math.round(weekHours * 10) / 10,
    monthHours: Math.round(monthHours * 10) / 10,
    overdueItems
  }
}

export const calculatePerformanceDataOptimized = (timeEntries: SimpleTimeEntry[]) => {
  const monthsData: Record<string, { horas: number; facturado: number }> = {}

  timeEntries.forEach(entry => {
    const date = new Date(entry.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const duration = (entry.duration_minutes || 0) / 60

    if (!monthsData[monthKey]) {
      monthsData[monthKey] = { horas: 0, facturado: 0 }
    }

    monthsData[monthKey].horas += duration
    if (entry.is_billable) {
      monthsData[monthKey].facturado += duration * 50 // €50/hora estimado
    }
  })

  // Últimos 6 meses
  return Object.entries(monthsData)
    .slice(-6)
    .map(([month, data]) => ({
      month,
      horas: Math.round(data.horas * 10) / 10,
      facturado: Math.round(data.facturado),
      objetivo: 160 // 160 horas objetivo
    }))
}

// Actividades recientes simplificadas sin joins
export const generateRecentActivitiesOptimized = (
  contacts: SimpleContactData[],
  cases: SimpleCaseData[],
  timeEntries: SimpleTimeEntry[]
) => {
  const activities: Array<{
    id: string
    type: 'client' | 'case' | 'time'
    title: string
    description: string
    timestamp: Date
    user: string
  }> = []

  // Solo los más recientes de cada tipo
  contacts.slice(0, 2).forEach(contact => {
    activities.push({
      id: `contact-${contact.id}`,
      type: 'client',
      title: 'Nuevo contacto',
      description: contact.name,
      timestamp: new Date(contact.created_at),
      user: 'Sistema'
    })
  })

  cases.slice(0, 2).forEach(case_ => {
    activities.push({
      id: `case-${case_.id}`,
      type: 'case',
      title: 'Nuevo caso',
      description: case_.title || 'Sin título',
      timestamp: new Date(case_.created_at),
      user: 'Sistema'
    })
  })

  timeEntries.slice(0, 3).forEach(entry => {
    const duration = Math.round((entry.duration_minutes || 0) / 60 * 10) / 10
    activities.push({
      id: `time-${entry.id}`,
      type: 'time',
      title: 'Tiempo registrado',
      description: `${duration}h`,
      timestamp: new Date(entry.created_at),
      user: 'Usuario'
    })
  })

  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5) // Solo 5 actividades más recientes
}