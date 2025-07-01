
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, DollarSign, TrendingDown, Activity } from 'lucide-react'
import { EnhancedAIUsageStats } from '@/hooks/useEnhancedAIUsage'

interface EnhancedAIAdminAlertsProps {
  stats: EnhancedAIUsageStats
  isLoading: boolean
}

export function EnhancedAIAdminAlerts({ stats, isLoading }: EnhancedAIAdminAlertsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas Inteligentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'high_cost': return DollarSign
      case 'high_failures': return TrendingDown
      case 'unusual_pattern': return Activity
      default: return AlertTriangle
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const criticalAlerts = stats.anomalies.filter(a => a.severity === 'high')
  const totalAlerts = stats.anomalies.length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Alertas Inteligentes
          </CardTitle>
          <CardDescription>
            {totalAlerts} alertas detectadas, {criticalAlerts.length} críticas
          </CardDescription>
        </div>
        {totalAlerts > 0 && (
          <Button variant="outline" size="sm">
            Configurar Alertas
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.anomalies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No se detectaron anomalías</p>
            <p className="text-sm">El sistema está funcionando normalmente</p>
          </div>
        ) : (
          stats.anomalies.map((anomaly, index) => {
            const IconComponent = getAlertIcon(anomaly.type)
            return (
              <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                <div className={`p-2 rounded-lg ${
                  anomaly.severity === 'high' ? 'bg-red-50 text-red-600' :
                  anomaly.severity === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getAlertColor(anomaly.severity) as any}>
                      {anomaly.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(anomaly.timestamp).toLocaleString('es-ES')}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{anomaly.message}</p>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
