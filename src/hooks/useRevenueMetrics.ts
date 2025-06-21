
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface RevenueMetrics {
  id: string
  org_id: string
  metric_date: string
  proposals_sent: number
  proposals_won: number
  proposals_lost: number
  total_revenue: number
  average_deal_size: number
  conversion_rate: number
  created_at: string
}

export const useRevenueMetrics = (dateRange?: { from: Date; to: Date }) => {
  const { user } = useApp()

  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ['revenue-metrics', user?.org_id, dateRange],
    queryFn: async () => {
      if (!user?.org_id) return []

      let query = supabase
        .from('revenue_metrics')
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
      return data as RevenueMetrics[]
    },
    enabled: !!user?.org_id
  })

  // Calcular métricas agregadas
  const totalRevenue = metrics.reduce((sum, m) => sum + m.total_revenue, 0)
  const totalProposalsSent = metrics.reduce((sum, m) => sum + m.proposals_sent, 0)
  const totalProposalsWon = metrics.reduce((sum, m) => sum + m.proposals_won, 0)
  const averageConversionRate = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + m.conversion_rate, 0) / metrics.length 
    : 0
  const averageDealSize = totalProposalsWon > 0 ? totalRevenue / totalProposalsWon : 0

  return {
    metrics,
    isLoading,
    summary: {
      totalRevenue,
      totalProposalsSent,
      totalProposalsWon,
      averageConversionRate,
      averageDealSize,
      totalProposalsLost: metrics.reduce((sum, m) => sum + m.proposals_lost, 0)
    }
  }
}
