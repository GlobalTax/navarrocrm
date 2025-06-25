
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAlertsManager } from '@/hooks/analytics/useAlertsManager'
import { analyticsCache } from '@/services/analytics/AnalyticsCache'
import { Activity, Database, Zap, Clock, TrendingUp, AlertTriangle } from 'lucide-react'

interface SystemMetrics {
  uptime: number
  cacheHitRate: number
  alertsProcessed: number
  avgResponseTime: number
  dataQuality: number
  systemLoad: number
}

export const SystemHealthMonitor: React.FC = () => {
  const { activeAlertsCount, criticalAlertsCount } = useAlertsManager()
  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: 99.9,
    cacheHitRate: 85,
    alertsProcessed: 0,
    avgResponseTime: 120,
    dataQuality: 95,
    systemLoad: 25
  })

  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy')

  useEffect(() => {
    const updateMetrics = () => {
      const cacheStats = analyticsCache.getStats()
      
      setMetrics(prev => ({
        ...prev,
        cacheHitRate: cacheStats.hitRate,
        alertsProcessed: activeAlertsCount,
        avgResponseTime: Math.random() * 100 + 80, // Simulado
        systemLoad: Math.random() * 30 + 20, // Simulado
        dataQuality: Math.max(90, 100 - (criticalAlertsCount * 5))
      }))

      // Determinar estado del sistema
      if (criticalAlertsCount > 5 || cacheStats.hitRate < 50) {
        setSystemStatus('critical')
      } else if (criticalAlertsCount > 2 || activeAlertsCount > 10) {
        setSystemStatus('warning')
      } else {
        setSystemStatus('healthy')
      }
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 10000) // Actualizar cada 10 segundos

    return () => clearInterval(interval)
  }, [activeAlertsCount, criticalAlertsCount])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500 text-white'
      case 'warning': return 'bg-yellow-500 text-white'
      case 'critical': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'Saludable'
      case 'warning': return 'Advertencia'
      case 'critical': return 'Crítico'
      default: return 'Desconocido'
    }
  }

  const getProgressColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'bg-green-500'
    if (value >= thresholds.warning) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Estado general del sistema */}
      <Card className={`border-2 ${systemStatus === 'healthy' ? 'border-green-200 bg-green-50' : 
        systemStatus === 'warning' ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-6 w-6" />
              <span>Estado del Sistema</span>
            </CardTitle>
            <Badge className={getStatusColor(systemStatus)}>
              {getStatusText(systemStatus)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-2xl">{metrics.uptime}%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-2xl">{activeAlertsCount}</div>
              <div className="text-muted-foreground">Alertas Activas</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-2xl">{criticalAlertsCount}</div>
              <div className="text-muted-foreground">Críticas</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-2xl">{Math.round(metrics.avgResponseTime)}ms</div>
              <div className="text-muted-foreground">Respuesta Promedio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Cache Hit Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{Math.round(metrics.cacheHitRate)}%</div>
            <Progress 
              value={metrics.cacheHitRate} 
              className="h-2"
              style={{
                background: getProgressColor(metrics.cacheHitRate, { good: 80, warning: 60 })
              }}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.cacheHitRate >= 80 ? 'Excelente' : 
               metrics.cacheHitRate >= 60 ? 'Bueno' : 'Necesita optimización'}
            </p>
          </CardContent>
        </Card>

        {/* System Load */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carga del Sistema</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{Math.round(metrics.systemLoad)}%</div>
            <Progress 
              value={metrics.systemLoad} 
              className="h-2"
              style={{
                background: getProgressColor(100 - metrics.systemLoad, { good: 70, warning: 50 })
              }}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.systemLoad <= 30 ? 'Óptimo' : 
               metrics.systemLoad <= 50 ? 'Moderado' : 'Alto'}
            </p>
          </CardContent>
        </Card>

        {/* Data Quality */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calidad de Datos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{Math.round(metrics.dataQuality)}%</div>
            <Progress 
              value={metrics.dataQuality} 
              className="h-2"
              style={{
                background: getProgressColor(metrics.dataQuality, { good: 90, warning: 75 })
              }}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.dataQuality >= 90 ? 'Excelente' : 
               metrics.dataQuality >= 75 ? 'Buena' : 'Requiere atención'}
            </p>
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo de Respuesta</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{Math.round(metrics.avgResponseTime)}ms</div>
            <Progress 
              value={Math.min(100, (500 - metrics.avgResponseTime) / 5)} 
              className="h-2"
              style={{
                background: getProgressColor(500 - metrics.avgResponseTime, { good: 350, warning: 200 })
              }}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.avgResponseTime <= 150 ? 'Excelente' : 
               metrics.avgResponseTime <= 300 ? 'Bueno' : 'Lento'}
            </p>
          </CardContent>
        </Card>

        {/* Alertas Procesadas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Procesadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{metrics.alertsProcessed}</div>
            <p className="text-xs text-muted-foreground">
              {criticalAlertsCount > 0 ? `${criticalAlertsCount} críticas` : 'Sistema estable'}
            </p>
          </CardContent>
        </Card>

        {/* Status General */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Analytics Engine</span>
                <Badge className="bg-green-100 text-green-800 text-xs">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Alert System</span>
                <Badge className="bg-green-100 text-green-800 text-xs">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cache Layer</span>
                <Badge className="bg-green-100 text-green-800 text-xs">Online</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recomendaciones del sistema */}
      {systemStatus !== 'healthy' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Recomendaciones del Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-yellow-800">
              {criticalAlertsCount > 5 && (
                <li>• Revisar y resolver las alertas críticas inmediatamente</li>
              )}
              {metrics.cacheHitRate < 50 && (
                <li>• Optimizar la configuración del cache para mejorar el rendimiento</li>
              )}
              {metrics.systemLoad > 80 && (
                <li>• Considerar escalar recursos del sistema debido a alta carga</li>
              )}
              {metrics.avgResponseTime > 300 && (
                <li>• Investigar la causa de los tiempos de respuesta lentos</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
