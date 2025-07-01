
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

interface TriggerAlertParams {
  org_id: string
  alert_type: 'high_cost' | 'high_failures' | 'unusual_pattern'
  message: string
  severity: 'low' | 'medium' | 'high'
  data: any
}

export const useAIAlertTrigger = () => {
  return useMutation({
    mutationFn: async (params: TriggerAlertParams) => {
      try {
        const { data, error } = await supabase.functions.invoke('send-ai-alert', {
          body: params
        })

        if (error) throw error
        return data
      } catch (error) {
        console.error('Error triggering AI alert:', error)
        throw error
      }
    },
    onError: (error: any) => {
      console.error('Error triggering AI alert:', error)
    }
  })
}

// Hook para detectar y triggear alertas automáticamente
export const useAutoAIAlerts = (stats: any, orgId: string) => {
  const triggerAlert = useAIAlertTrigger()

  const checkAndTriggerAlerts = () => {
    if (!stats || !orgId) return

    try {
      // Detectar costo alto (usando las anomalías ya calculadas)
      const highCostAnomaly = stats.anomalies?.find((a: any) => a.type === 'high_cost')
      if (highCostAnomaly) {
        triggerAlert.mutate({
          org_id: orgId,
          alert_type: 'high_cost',
          message: highCostAnomaly.message,
          severity: highCostAnomaly.severity,
          data: { cost: stats.totalCost }
        })
      }

      // Detectar alta tasa de fallos
      const highFailuresAnomaly = stats.anomalies?.find((a: any) => a.type === 'high_failures')
      if (highFailuresAnomaly) {
        triggerAlert.mutate({
          org_id: orgId,
          alert_type: 'high_failures',
          message: highFailuresAnomaly.message,
          severity: highFailuresAnomaly.severity,
          data: { failure_rate: 100 - stats.successRate }
        })
      }

      // Detectar patrones inusuales
      const unusualPatternAnomaly = stats.anomalies?.find((a: any) => a.type === 'unusual_pattern')
      if (unusualPatternAnomaly) {
        triggerAlert.mutate({
          org_id: orgId,
          alert_type: 'unusual_pattern',
          message: unusualPatternAnomaly.message,
          severity: unusualPatternAnomaly.severity,
          data: { calls: stats.totalCalls }
        })
      }
    } catch (error) {
      console.error('Error checking alerts:', error)
    }
  }

  return { checkAndTriggerAlerts }
}
