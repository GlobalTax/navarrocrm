
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
      // Deshabilitar temporalmente esta función para evitar errores 400
      console.log('⚠️ Función get_historical_revenue deshabilitada temporalmente')
      return []
    },
    enabled: false, // Deshabilitar completamente
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: false, // No refetch automático
    gcTime: 30 * 60 * 1000, // 30 minutos en cache
  })
}
