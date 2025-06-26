
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
      if (!user?.org_id) {
        console.log('⚠️ No org_id disponible para obtener clientes en riesgo')
        return []
      }

      console.log('⚠️ Obteniendo clientes en riesgo para org:', user.org_id)

      try {
        const { data, error } = await supabase.rpc('identify_churn_risk_clients', {
          org_uuid: user.org_id
        })

        if (error) {
          console.error('❌ Error fetching churn risk clients:', error)
          // Silenciar errores 404/400 para evitar spam en consola
          return []
        }

        console.log('✅ Clientes en riesgo obtenidos:', data?.length || 0)
        return data || []
      } catch (error) {
        console.error('❌ Error en useChurnRiskClients:', error)
        return []
      }
    },
    enabled: !!user?.org_id,
    retry: false, // No reintentar para reducir spam
    refetchOnWindowFocus: false,
    // Reducir significativamente la frecuencia para evitar rate limiting
    refetchInterval: 15 * 60 * 1000, // 15 minutos
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}
