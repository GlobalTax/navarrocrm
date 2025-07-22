
import { CompactMetricWidget } from './CompactMetricWidget'
import { Clock, Users, FileText, Target, TrendingUp, Euro, AlertTriangle, CheckCircle } from 'lucide-react'

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

export const EnhancedDashboardMetrics = ({ stats }: EnhancedDashboardMetricsProps) => {
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

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)

  const formatHours = (hours: number) => 
    `${hours.toFixed(1)}h`

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
          value={stats.totalClients}
          icon={Users}
        />
        
        <CompactMetricWidget
          title="Expedientes"
          value={`${stats.totalActiveCases}/${stats.totalCases}`}
          change="Activos/Total"
          changeType="neutral"
          icon={FileText}
        />
        
        <CompactMetricWidget
          title="Utilización"
          value={`${stats.utilizationRate}%`}
          changeType={stats.utilizationRate >= 75 ? 'positive' : stats.utilizationRate >= 50 ? 'neutral' : 'negative'}
          icon={Target}
        />
      </div>

      {/* Métricas secundarias - Grid más compacto */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CompactMetricWidget
          title="Este Mes"
          value={formatHours(stats.hoursThisMonth)}
          change="Horas registradas"
          changeType="neutral"
          icon={TrendingUp}
          size="sm"
        />
        
        <CompactMetricWidget
          title="Ingresos Est."
          value={formatCurrency(stats.totalRevenue)}
          change="Basado en horas"
          changeType="positive"
          icon={Euro}
          size="sm"
        />
        
        <CompactMetricWidget
          title="Tareas Pendientes"
          value={stats.pendingTasks}
          changeType={stats.pendingTasks > 10 ? 'negative' : 'neutral'}
          icon={AlertTriangle}
          size="sm"
        />
        
        <CompactMetricWidget
          title="Facturas Pend."
          value={stats.pendingInvoices}
          changeType={stats.pendingInvoices > 5 ? 'negative' : 'positive'}
          icon={CheckCircle}
          size="sm"
        />
      </div>
    </div>
  )
}
