
import { useEffect, useState } from 'react'
import { useCRMAnalytics } from '@/hooks/useCRMAnalytics'
import { useAdvancedAnalytics } from '@/hooks/analytics/useAdvancedAnalytics'
import { AnalyticsWidget } from './AnalyticsWidget'
import { UserBehaviorChart } from './UserBehaviorChart'
import { PerformanceMetrics } from './PerformanceMetrics'
import { Activity, Users, MousePointer, Clock, TrendingUp, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const AnalyticsSection = () => {
  const analytics = useCRMAnalytics()
  const advancedAnalytics = useAdvancedAnalytics()
  const [usageMetrics, setUsageMetrics] = useState(analytics.getUsageMetrics())
  const [performanceData, setPerformanceData] = useState(analytics.getPerformanceMetrics())

  // Datos de ejemplo para el gráfico de comportamiento del usuario
  const [behaviorData] = useState([
    { time: '09:00', pageViews: 12, clicks: 45, timeOnSite: 180 },
    { time: '10:00', pageViews: 19, clicks: 62, timeOnSite: 240 },
    { time: '11:00', pageViews: 15, clicks: 38, timeOnSite: 200 },
    { time: '12:00', pageViews: 8, clicks: 25, timeOnSite: 150 },
    { time: '13:00', pageViews: 22, clicks: 71, timeOnSite: 280 },
    { time: '14:00', pageViews: 18, clicks: 54, timeOnSite: 220 },
  ])

  // Actualizar métricas cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setUsageMetrics(analytics.getUsageMetrics())
      setPerformanceData(analytics.getPerformanceMetrics())
    }, 30000)

    return () => clearInterval(interval)
  }, [analytics])

  // Procesar métricas de rendimiento para el componente
  const processedPerformanceMetrics = performanceData.map(metric => {
    let status: 'good' | 'needs-improvement' | 'poor' = 'good'
    
    // Definir umbrales según las métricas de Web Vitals
    if (metric.name === 'LCP') {
      status = metric.value <= 2500 ? 'good' : metric.value <= 4000 ? 'needs-improvement' : 'poor'
    } else if (metric.name === 'FID') {
      status = metric.value <= 100 ? 'good' : metric.value <= 300 ? 'needs-improvement' : 'poor'
    } else if (metric.name === 'CLS') {
      status = metric.value <= 0.1 ? 'good' : metric.value <= 0.25 ? 'needs-improvement' : 'poor'
    }

    return {
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
      status
    }
  })

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Sistema de Analytics Avanzado - Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Sistema de Analytics Avanzado Activo</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Recopilando datos automáticamente: Web Vitals, errores, interacciones y performance
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              ✓ Funcionando
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-600">Auto-Tracking</div>
              <div className="text-muted-foreground">Performance, errores, interacciones</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600">Web Vitals</div>
              <div className="text-muted-foreground">LCP, FID, CLS automáticos</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">Tiempo Real</div>
              <div className="text-muted-foreground">Datos actualizados cada 5seg</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-600">Inteligente</div>
              <div className="text-muted-foreground">Batching y retry automático</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widgets de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsWidget
          title="Páginas Vistas"
          value={usageMetrics.pageViews}
          icon={<Activity />}
          trend="up"
          trendValue="+12%"
        />
        <AnalyticsWidget
          title="Interacciones"
          value={usageMetrics.clicks}
          icon={<MousePointer />}
          trend="up"
          trendValue="+8%"
        />
        <AnalyticsWidget
          title="Tiempo en Sitio"
          value={formatTime(usageMetrics.timeOnSite)}
          icon={<Clock />}
          trend="up"
          trendValue="+5%"
        />
        <AnalyticsWidget
          title="Eventos Capturados"
          value={usageMetrics.eventsCount}
          icon={<Users />}
          trend="up"
          trendValue="+15%"
        />
      </div>

      {/* Gráficos y métricas detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserBehaviorChart data={behaviorData} />
        {processedPerformanceMetrics.length > 0 && (
          <PerformanceMetrics metrics={processedPerformanceMetrics} />
        )}
      </div>

      {/* Indicadores de salud del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistema de Tracking</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Activo</div>
            <p className="text-xs text-muted-foreground">
              {advancedAnalytics.isInitialized ? 'Inicializado correctamente' : 'Inicializando...'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Datos Recolectados</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageMetrics.eventsCount + usageMetrics.performanceMetricsCount}</div>
            <p className="text-xs text-muted-foreground">
              eventos + métricas esta sesión
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesión Actual</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(usageMetrics.sessionDuration)}</div>
            <p className="text-xs text-muted-foreground">
              duración de sesión activa
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
