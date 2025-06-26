import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface HistoricalRevenueData {
  month_date: string
  revenue: number
  proposal_count: number
  conversion_rate: number
}

export const useHistoricalRevenue = (monthsBack: number = 12) => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['historical-revenue', user?.org_id, monthsBack],
    queryFn: async (): Promise<HistoricalRevenueData[]> => {
      if (!user?.org_id) {
        console.log('📊 No org_id disponible para obtener ingresos históricos')
        return []
      }

      console.log('📊 Obteniendo ingresos históricos para org:', user.org_id)

      try {
        const { data, error } = await supabase.rpc('get_historical_revenue', {
          org_uuid: user.org_id,
          months_back: monthsBack
        })

        if (error) {
          console.error('❌ Error fetching historical revenue:', error)
          return []
        }

        console.log('✅ Ingresos históricos obtenidos:', data?.length || 0)
        return data || []
      } catch (error) {
        console.error('❌ Error en useHistoricalRevenue:', error)
        return []
      }
    },
    enabled: !!user?.org_id,
    retry: 1,
    refetchOnWindowFocus: false,
    // Aumentar intervalo para reducir rate limiting
    refetchInterval: 10 * 60 * 1000, // 10 minutos
  })
}
