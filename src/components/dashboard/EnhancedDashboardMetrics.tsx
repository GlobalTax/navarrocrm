
import React from 'react'
import { CompactMetricWidget } from './CompactMetricWidget'
import { Clock, Users, FileText, Target, TrendingUp, Euro, AlertTriangle, CheckCircle } from 'lucide-react'
import { OptimizedDashboardData } from '@/hooks/useOptimizedDashboard'

interface EnhancedDashboardMetricsProps {
  data: OptimizedDashboardData
  isLoading?: boolean
  error?: string | null
}

export const EnhancedDashboardMetrics = React.memo(({ 
  data, 
  isLoading, 
  error 
}: EnhancedDashboardMetricsProps) => {
  // Memoize expensive calculations
  const calculations = React.useMemo(() => {
    const { stats } = data
    const utilizationRate = stats.totalTimeEntries > 0 
      ? Math.round((stats.totalBillableHours / (stats.totalBillableHours + stats.totalNonBillableHours)) * 100) 
      : 0
    
    const totalRevenue = stats.totalBillableHours * 50 // €50/hour estimate
    
    const formatCurrency = (amount: number) => 
      new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)

    const formatHours = (hours: number) => 
      `${hours.toFixed(1)}h`

    return {
      utilizationRate,
      totalRevenue,
      formatCurrency,
      formatHours
    }
  }, [data.stats])

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-700 text-sm">Error cargando métricas: {error}</p>
      </div>
    )
  }

  const { stats } = data
  const { utilizationRate, totalRevenue, formatCurrency, formatHours } = calculations

  return (
    <div className="space-y-6 mb-6">
      {/* Métricas principales - Grid compacto */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CompactMetricWidget
          title="Horas Facturables"
          value={formatHours(stats.totalBillableHours)}
          change={`${stats.totalTimeEntries} registros`}
          changeType="neutral"
          icon={Clock}
        />
        
        <CompactMetricWidget
          title="Clientes Activos"
          value={stats.totalContacts}
          icon={Users}
        />
        
        <CompactMetricWidget
          title="Expedientes"
          value={`${stats.activeCases}/${stats.totalCases}`}
          change="Activos/Total"
          changeType="neutral"
          icon={FileText}
        />
        
        <CompactMetricWidget
          title="Utilización"
          value={`${utilizationRate}%`}
          changeType={utilizationRate >= 75 ? 'positive' : utilizationRate >= 50 ? 'neutral' : 'negative'}
          icon={Target}
        />
      </div>

      {/* Métricas secundarias - Grid más compacto */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CompactMetricWidget
          title="Este Mes"
          value={formatHours(stats.thisMonthHours)}
          change="Horas registradas"
          changeType="neutral"
          icon={TrendingUp}
          size="sm"
        />
        
        <CompactMetricWidget
          title="Ingresos Est."
          value={formatCurrency(totalRevenue)}
          change="Basado en horas"
          changeType="positive"
          icon={Euro}
          size="sm"
        />
        
        <CompactMetricWidget
          title="Tareas Pendientes"
          value={data.quickStats.overdueItems}
          changeType={data.quickStats.overdueItems > 10 ? 'negative' : 'neutral'}
          icon={AlertTriangle}
          size="sm"
        />
        
        <CompactMetricWidget
          title="Casos Nuevos"
          value={stats.thisMonthCases}
          changeType="positive"
          icon={CheckCircle}
          size="sm"
        />
      </div>
    </div>
  )
})

EnhancedDashboardMetrics.displayName = 'EnhancedDashboardMetrics'
