
import { CompactMetricWidget } from './CompactMetricWidget'
import { Clock, Users, FileText, Target, TrendingUp, Euro, AlertTriangle, CheckCircle } from 'lucide-react'
import { memo } from 'react'

interface DashboardStats {
  totalTimeEntries: number
  totalBillableHours: number
  totalClients: number
  totalCases: number
  totalActiveCases: number
  pendingInvoices: number
  hoursThisWeek: number
  hoursThisMonth: number
  utilizationRate: number
  averageHoursPerDay: number
  totalRevenue: number
  pendingTasks: number
  overdueTasks: number
  loading?: boolean
  error?: string | null
}

interface EnhancedDashboardMetricsProps {
  stats: DashboardStats
}

const EnhancedDashboardMetricsComponent = ({ stats }: EnhancedDashboardMetricsProps) => {
  if (stats.loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (stats.error) {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-700 text-sm">Error cargando métricas: {stats.error}</p>
      </div>
    )
  }

  // Funciones de formato con validación robusta
  const formatCurrency = (amount: number | undefined | null) => {
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(validAmount)
  }

  const formatHours = (hours: number | undefined | null) => {
    const validHours = typeof hours === 'number' && !isNaN(hours) ? hours : 0
    return `${validHours.toFixed(1)}h`
  }

  // Validar y normalizar todas las métricas
  const safeStats = {
    totalTimeEntries: stats.totalTimeEntries || 0,
    totalBillableHours: stats.totalBillableHours || 0,
    totalClients: stats.totalClients || 0,
    totalCases: stats.totalCases || 0,
    totalActiveCases: stats.totalActiveCases || 0,
    pendingInvoices: stats.pendingInvoices || 0,
    hoursThisWeek: stats.hoursThisWeek || 0,
    hoursThisMonth: stats.hoursThisMonth || 0,
    utilizationRate: stats.utilizationRate || 0,
    averageHoursPerDay: stats.averageHoursPerDay || 0,
    totalRevenue: stats.totalRevenue || 0,
    pendingTasks: stats.pendingTasks || 0,
    overdueTasks: stats.overdueTasks || 0
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Métricas principales - Grid compacto */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CompactMetricWidget
          title="Horas Facturables"
          value={formatHours(safeStats.totalBillableHours)}
          change={`${safeStats.totalTimeEntries} registros`}
          changeType="neutral"
          icon={Clock}
        />
        
        <CompactMetricWidget
          title="Clientes Activos"
          value={safeStats.totalClients}
          icon={Users}
        />
        
        <CompactMetricWidget
          title="Expedientes"
          value={`${safeStats.totalActiveCases}/${safeStats.totalCases}`}
          change="Activos/Total"
          changeType="neutral"
          icon={FileText}
        />
        
        <CompactMetricWidget
          title="Utilización"
          value={`${safeStats.utilizationRate}%`}
          changeType={safeStats.utilizationRate >= 75 ? 'positive' : safeStats.utilizationRate >= 50 ? 'neutral' : 'negative'}
          icon={Target}
        />
      </div>

      {/* Métricas secundarias - Grid más compacto */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CompactMetricWidget
          title="Este Mes"
          value={formatHours(safeStats.hoursThisMonth)}
          change="Horas registradas"
          changeType="neutral"
          icon={TrendingUp}
          size="sm"
        />
        
        <CompactMetricWidget
          title="Ingresos Est."
          value={formatCurrency(safeStats.totalRevenue)}
          change="Basado en horas"
          changeType="positive"
          icon={Euro}
          size="sm"
        />
        
        <CompactMetricWidget
          title="Tareas Pendientes"
          value={safeStats.pendingTasks}
          changeType={safeStats.pendingTasks > 10 ? 'negative' : 'neutral'}
          icon={AlertTriangle}
          size="sm"
        />
        
        <CompactMetricWidget
          title="Facturas Pend."
          value={safeStats.pendingInvoices}
          changeType={safeStats.pendingInvoices > 5 ? 'negative' : 'positive'}
          icon={CheckCircle}
          size="sm"
        />
      </div>
    </div>
  )
}

// Memoización profunda de estadísticas del dashboard
export const EnhancedDashboardMetrics = memo(EnhancedDashboardMetricsComponent, (prevProps, nextProps) => {
  const prevStats = prevProps.stats
  const nextStats = nextProps.stats

  // Comparación shallow de todas las propiedades de stats
  return (
    prevStats.totalTimeEntries === nextStats.totalTimeEntries &&
    prevStats.totalBillableHours === nextStats.totalBillableHours &&
    prevStats.totalClients === nextStats.totalClients &&
    prevStats.totalCases === nextStats.totalCases &&
    prevStats.totalActiveCases === nextStats.totalActiveCases &&
    prevStats.pendingInvoices === nextStats.pendingInvoices &&
    prevStats.hoursThisWeek === nextStats.hoursThisWeek &&
    prevStats.hoursThisMonth === nextStats.hoursThisMonth &&
    prevStats.utilizationRate === nextStats.utilizationRate &&
    prevStats.averageHoursPerDay === nextStats.averageHoursPerDay &&
    prevStats.totalRevenue === nextStats.totalRevenue &&
    prevStats.pendingTasks === nextStats.pendingTasks &&
    prevStats.overdueTasks === nextStats.overdueTasks &&
    prevStats.loading === nextStats.loading &&
    prevStats.error === nextStats.error
  )
})

EnhancedDashboardMetrics.displayName = 'EnhancedDashboardMetrics'
