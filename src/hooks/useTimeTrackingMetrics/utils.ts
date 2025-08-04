
import type { TimeEntry } from '@/features/time-tracking'
import type { TimeMetrics, MetricsPeriod } from './types'

export const getDateRangeForPeriod = (period: MetricsPeriod) => {
  const now = new Date()
  let startDate = new Date()
  
  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0)
      break
    case 'week':
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(now.getMonth() - 1)
      break
  }
  
  return startDate
}

export const filterTimeEntriesByPeriod = (
  entries: TimeEntry[], 
  period: MetricsPeriod, 
  visibleUserIds: string[]
) => {
  const startDate = getDateRangeForPeriod(period)
  
  return entries.filter(entry => {
    const entryDate = new Date(entry.created_at)
    const isInPeriod = entryDate >= startDate
    const hasPermission = visibleUserIds.includes(entry.user_id)
    
    return isInPeriod && hasPermission
  })
}

export const calculateOverallMetrics = (entries: TimeEntry[]): TimeMetrics => {
  const totalHours = entries.reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)
  const billableHours = entries
    .filter(entry => entry.is_billable)
    .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)
  const utilizationRate = totalHours > 0 ? (billableHours / totalHours) * 100 : 0

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    billableHours: Math.round(billableHours * 10) / 10,
    utilizationRate: Math.round(utilizationRate),
    totalEntries: entries.length,
    avgEntryDuration: entries.length > 0 
      ? Math.round((totalHours * 60) / entries.length) 
      : 0
  }
}
