
import { useDashboardData } from '@/hooks/useDashboardData'
import { MetricCard } from './components/MetricCard'
import { MetricsLoadingSkeleton } from './components/MetricsLoadingSkeleton'
import { calculateMetrics } from './utils/dashboardMetricsUtils'

export const CleanDashboardMetrics = () => {
  const { data: dashboardData, isLoading, error } = useDashboardData()

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error al cargar las métricas</p>
      </div>
    )
  }

  if (isLoading) {
    return <MetricsLoadingSkeleton />
  }

  const metrics = calculateMetrics(dashboardData)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          subtitle={metric.subtitle}
          icon={metric.icon}
          trend={metric.trend}
        />
      ))}
    </div>
  )
}
