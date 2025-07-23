
import { startOfMonth, format, subMonths } from 'date-fns'

// Type definitions for dashboard data
export interface CaseData {
  id: string
  title?: string
  status: string
  created_at: string
}

export interface ContactData {
  id: string
  name: string
  created_at: string
}

export interface TimeEntryData {
  id: string
  duration_minutes: number
  is_billable: boolean
  created_at: string
  user_id?: string
  description?: string
  case?: {
    title?: string
    contact?: {
      name?: string
    }
  }
}

export interface TaskData {
  id: string
  title: string
  due_date?: string
  status: string
  completed_at?: string
}

export const calculateDashboardStats = (
  cases: CaseData[],
  contacts: ContactData[],
  timeEntries: TimeEntryData[]
) => {
  const now = new Date()
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  return {
    totalCases: cases.length,
    activeCases: cases.filter(c => c.status === 'open').length,
    totalContacts: contacts.length,
    totalTimeEntries: timeEntries.length,
    totalBillableHours: timeEntries
      .filter(t => t.is_billable)
      .reduce((sum, t) => sum + (t.duration_minutes || 0), 0) / 60,
    totalNonBillableHours: timeEntries
      .filter(t => !t.is_billable)
      .reduce((sum, t) => sum + (t.duration_minutes || 0), 0) / 60,
    thisMonthCases: cases.filter(c => new Date(c.created_at) >= currentMonth).length,
    thisMonthContacts: contacts.filter(c => new Date(c.created_at) >= currentMonth).length,
    thisMonthHours: timeEntries
      .filter(t => new Date(t.created_at) >= currentMonth)
      .reduce((sum, t) => sum + (t.duration_minutes || 0), 0) / 60
  }
}

export const calculatePerformanceData = (timeEntries: TimeEntryData[]) => {
  const now = new Date()
  const performanceData = []
  
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i))
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
    
    const monthEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.created_at)
      return entryDate >= monthStart && entryDate <= monthEnd
    })

    const totalHours = monthEntries.reduce((sum, entry) => sum + ((entry.duration_minutes || 0) / 60), 0)
    const billableHours = monthEntries
      .filter(entry => entry.is_billable)
      .reduce((sum, entry) => sum + ((entry.duration_minutes || 0) / 60), 0)

    performanceData.push({
      month: format(monthStart, 'MMM'),
      horas: Math.round(totalHours),
      facturado: Math.round(billableHours),
      objetivo: 160
    })
  }
  
  return performanceData
}

export const calculateQuickStats = (timeEntries: TimeEntryData[], tasks: TaskData[]) => {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const todayEntries = timeEntries.filter(entry => entry?.created_at && new Date(entry.created_at) >= todayStart)
  const weekEntries = timeEntries.filter(entry => entry?.created_at && new Date(entry.created_at) >= weekStart)
  const monthEntries = timeEntries.filter(entry => entry?.created_at && new Date(entry.created_at) >= currentMonth)
  const overdueTasks = tasks.filter(task => 
    task?.due_date && 
    new Date(task.due_date) < now && 
    task?.status !== 'completed'
  )

  return {
    todayHours: todayEntries.reduce((sum, entry) => sum + ((entry.duration_minutes || 0) / 60), 0),
    weekHours: weekEntries.reduce((sum, entry) => sum + ((entry.duration_minutes || 0) / 60), 0),
    monthHours: monthEntries.reduce((sum, entry) => sum + ((entry.duration_minutes || 0) / 60), 0),
    overdueItems: overdueTasks.length
  }
}
