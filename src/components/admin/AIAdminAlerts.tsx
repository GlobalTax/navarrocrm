
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import { AIUsageStats } from '@/hooks/useAIUsage'

interface AIAdminAlertsProps {
  stats: AIUsageStats
  isLoading: boolean
}

export const AIAdminAlerts = ({ stats, isLoading }: AIAdminAlertsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Alertas y Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasHighCost = stats.totalCost > 10
  const hasLowSuccessRate = stats.successRate < 95
  const hasNoActivity = stats.totalCalls === 0
  const allGood = !hasHighCost && !hasLowSuccessRate && !hasNoActivity

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Alertas y Recomendaciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {hasHighCost && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                <strong>Costo elevado:</strong> El gasto mensual supera los $10 USD. 
                Considera revisar el uso y optimizar las consultas.
              </p>
            </div>
          )}
          
          {hasLowSuccessRate && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Tasa de error alta:</strong> La tasa de éxito es del {stats.successRate.toFixed(1)}%. 
                Revisa los logs para identificar problemas.
              </p>
            </div>
          )}
          
          {hasNoActivity && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Sin actividad:</strong> No se han registrado llamadas este mes. 
                Verifica que el asistente esté funcionando correctamente.
              </p>
            </div>
          )}
          
          {allGood && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <strong>Todo funcionando bien:</strong> No se han detectado problemas importantes.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
