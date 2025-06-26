
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface ChurnRiskClient {
  client_id: string
  client_name: string
  risk_score: number
  risk_factors: string[]
  last_activity_days: number
}

export const useChurnRiskClients = () => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['churn-risk-clients', user?.org_id],
    queryFn: async (): Promise<ChurnRiskClient[]> => {
      // Deshabilitar temporalmente esta función para evitar errores 404
      console.log('⚠️ Función identify_churn_risk_clients deshabilitada temporalmente')
      return []
    },
    enabled: false, // Deshabilitar completamente
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: false, // No refetch automático
    gcTime: 30 * 60 * 1000, // 30 minutos en cache
  })
}
