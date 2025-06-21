
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface RecurringRevenueMetrics {
  id: string
  org_id: string
  metric_date: string
  monthly_recurring_revenue: number
  annual_recurring_revenue: number
  active_subscriptions: number
  active_retainers: number
  new_mrr: number
  churned_mrr: number
  expansion_mrr: number
  contraction_mrr: number
  churn_rate: number
  created_at: string
}

export const useRecurringRevenue = (dateRange?: { from: Date; to: Date }) => {
  const { user } = useApp()

  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ['recurring-revenue', user?.org_id, dateRange],
    queryFn: async () => {
      if (!user?.org_id) return []

      let query = supabase
        .from('recurring_revenue_metrics')
        .select('*')
        .eq('org_id', user.org_id)
        .order('metric_date', { ascending: false })

      if (dateRange) {
        query = query
          .gte('metric_date', dateRange.from.toISOString().split('T')[0])
          .lte('metric_date', dateRange.to.toISOString().split('T')[0])
      }

      const { data, error } = await query.limit(12)

      if (error) throw error
      return data as RecurringRevenueMetrics[]
    },
    enabled: !!user?.org_id
  })

  // Calcular métricas actuales
  const currentMetrics = metrics[0] || {
    monthly_recurring_revenue: 0,
    annual_recurring_revenue: 0,
    active_subscriptions: 0,
    active_retainers: 0,
    churn_rate: 0
  }

  return {
    metrics,
    currentMetrics,
    isLoading
  }
}
