
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns'

export interface RecurringFeeHoursData {
  recurringFeeId: string
  includedHours: number
  hoursUsed: number
  hoursRemaining: number
  extraHours: number
  hourlyRateExtra: number
  extraAmount: number
  utilizationPercent: number
  periodStart: string
  periodEnd: string
}

function getCurrentPeriod(frequency: 'monthly' | 'quarterly' | 'yearly') {
  const now = new Date()
  switch (frequency) {
    case 'monthly':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'quarterly':
      return { start: startOfQuarter(now), end: endOfQuarter(now) }
    case 'yearly':
      return { start: startOfYear(now), end: endOfYear(now) }
  }
}

export const useRecurringFeeTimeEntries = (
  recurringFeeId: string | undefined,
  frequency: 'monthly' | 'quarterly' | 'yearly' = 'monthly',
  includedHours: number = 0,
  hourlyRateExtra: number = 0
) => {
  const { user } = useApp()
  const period = getCurrentPeriod(frequency)

  return useQuery({
    queryKey: ['recurring-fee-hours', recurringFeeId, frequency],
    queryFn: async (): Promise<RecurringFeeHoursData> => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('duration_minutes')
        .eq('recurring_fee_id', recurringFeeId!)
        .gte('created_at', period.start.toISOString())
        .lte('created_at', period.end.toISOString())

      if (error) throw error

      const totalMinutes = (data || []).reduce((sum, e) => sum + (e.duration_minutes || 0), 0)
      const hoursUsed = totalMinutes / 60
      const hoursRemaining = Math.max(0, includedHours - hoursUsed)
      const extraHours = Math.max(0, hoursUsed - includedHours)
      const extraAmount = extraHours * hourlyRateExtra
      const utilizationPercent = includedHours > 0 ? Math.round((hoursUsed / includedHours) * 100) : 0

      return {
        recurringFeeId: recurringFeeId!,
        includedHours,
        hoursUsed: Math.round(hoursUsed * 100) / 100,
        hoursRemaining: Math.round(hoursRemaining * 100) / 100,
        extraHours: Math.round(extraHours * 100) / 100,
        hourlyRateExtra,
        extraAmount: Math.round(extraAmount * 100) / 100,
        utilizationPercent,
        periodStart: period.start.toISOString(),
        periodEnd: period.end.toISOString(),
      }
    },
    enabled: !!recurringFeeId && !!user?.org_id,
  })
}

// Hook para obtener horas de múltiples cuotas en batch
export const useAllRecurringFeesHours = (
  fees: Array<{ id: string; frequency: 'monthly' | 'quarterly' | 'yearly'; included_hours: number; hourly_rate_extra: number }>
) => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['all-recurring-fees-hours', fees.map(f => f.id).join(',')],
    queryFn: async (): Promise<Record<string, RecurringFeeHoursData>> => {
      if (fees.length === 0) return {}

      const results: Record<string, RecurringFeeHoursData> = {}

      // Consultar todas las time_entries con recurring_fee_id en una sola query
      const feeIds = fees.map(f => f.id)
      const { data, error } = await supabase
        .from('time_entries')
        .select('recurring_fee_id, duration_minutes, created_at')
        .in('recurring_fee_id', feeIds)

      if (error) throw error

      for (const fee of fees) {
        const period = getCurrentPeriod(fee.frequency)
        const entries = (data || []).filter(e =>
          e.recurring_fee_id === fee.id &&
          new Date(e.created_at!) >= period.start &&
          new Date(e.created_at!) <= period.end
        )
        const totalMinutes = entries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0)
        const hoursUsed = totalMinutes / 60
        const hoursRemaining = Math.max(0, fee.included_hours - hoursUsed)
        const extraHours = Math.max(0, hoursUsed - fee.included_hours)
        const extraAmount = extraHours * fee.hourly_rate_extra
        const utilizationPercent = fee.included_hours > 0 ? Math.round((hoursUsed / fee.included_hours) * 100) : 0

        results[fee.id] = {
          recurringFeeId: fee.id,
          includedHours: fee.included_hours,
          hoursUsed: Math.round(hoursUsed * 100) / 100,
          hoursRemaining: Math.round(hoursRemaining * 100) / 100,
          extraHours: Math.round(extraHours * 100) / 100,
          hourlyRateExtra: fee.hourly_rate_extra,
          extraAmount: Math.round(extraAmount * 100) / 100,
          utilizationPercent,
          periodStart: period.start.toISOString(),
          periodEnd: period.end.toISOString(),
        }
      }

      return results
    },
    enabled: !!user?.org_id && fees.length > 0,
  })
}
