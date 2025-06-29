
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface MonthlyTimeStats {
  day_date: string
  billable_hours: number
  office_admin_hours: number
  business_dev_hours: number
  internal_hours: number
  total_hours: number
  entry_count: number
}

export interface MonthlyTimeSummary {
  totalHours: number
  billableHours: number
  officeAdminHours: number
  businessDevHours: number
  internalHours: number
  totalEntries: number
  utilizationRate: number
  avgHoursPerDay: number
  workingDays: number
}

export const useMonthlyTimeStats = (targetMonth?: number, targetYear?: number) => {
  const { user } = useApp()

  const { data: monthlyStats = [], isLoading, error } = useQuery({
    queryKey: ['monthly-time-stats', user?.org_id, targetMonth, targetYear],
    queryFn: async () => {
      if (!user?.org_id) return []

      const { data, error } = await supabase.rpc('get_monthly_time_stats', {
        org_uuid: user.org_id,
        target_month: targetMonth,
        target_year: targetYear
      })

      if (error) {
        console.error('Error fetching monthly time stats:', error)
        throw error
      }

      return (data || []) as MonthlyTimeStats[]
    },
    enabled: !!user?.org_id,
  })

  const monthlySummary: MonthlyTimeSummary = {
    totalHours: monthlyStats.reduce((sum, day) => sum + day.total_hours, 0),
    billableHours: monthlyStats.reduce((sum, day) => sum + day.billable_hours, 0),
    officeAdminHours: monthlyStats.reduce((sum, day) => sum + day.office_admin_hours, 0),
    businessDevHours: monthlyStats.reduce((sum, day) => sum + day.business_dev_hours, 0),
    internalHours: monthlyStats.reduce((sum, day) => sum + day.internal_hours, 0),
    totalEntries: monthlyStats.reduce((sum, day) => sum + day.entry_count, 0),
    utilizationRate: 0,
    avgHoursPerDay: 0,
    workingDays: monthlyStats.filter(day => day.total_hours > 0).length
  }

  // Calcular tasa de utilización y promedio de horas por día
  if (monthlySummary.totalHours > 0) {
    monthlySummary.utilizationRate = (monthlySummary.billableHours / monthlySummary.totalHours) * 100
  }
  
  if (monthlySummary.workingDays > 0) {
    monthlySummary.avgHoursPerDay = monthlySummary.totalHours / monthlySummary.workingDays
  }

  return {
    monthlyStats,
    monthlySummary,
    isLoading,
    error
  }
}
