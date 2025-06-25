
import { useEffect, useState } from 'react'
import { useCRMAnalytics } from '@/hooks/useCRMAnalytics'
import { AnalyticsWidget } from './AnalyticsWidget'
import { UserBehaviorChart } from './UserBehaviorChart'
import { PerformanceMetrics } from './PerformanceMetrics'
import { Activity, Users, MousePointer, Clock } from 'lucide-react'

export const AnalyticsSection = () => {
  const analytics = useCRMAnalytics()
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
          title="Eventos"
          value={usageMetrics.eventsCount}
          icon={<Users />}
          trend="neutral"
          trendValue="0%"
        />
      </div>

      {/* Gráficos y métricas detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserBehaviorChart data={behaviorData} />
        {processedPerformanceMetrics.length > 0 && (
          <PerformanceMetrics metrics={processedPerformanceMetrics} />
        )}
      </div>
    </div>
  )
}
