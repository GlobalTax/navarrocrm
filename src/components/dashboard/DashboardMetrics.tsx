
import { 
  Clock, 
  Users, 
  FolderOpen, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Target,
  CheckCircle
} from 'lucide-react'
import { MetricWidget } from './MetricWidget'
import { ActiveTimer } from './ActiveTimer'

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
  loading: boolean
  error: string | null
}

interface DashboardMetricsProps {
  stats: DashboardStats
}

export const DashboardMetrics = ({ stats }: DashboardMetricsProps) => {
  // Calcular cambios y tendencias
  const getChangeType = (value: number, threshold: number) => {
    if (value >= threshold) return 'positive'
    if (value >= threshold * 0.8) return 'neutral'
    return 'negative'
  }

  return (
    <>
      {/* Timer activo */}
      <ActiveTimer />

      {/* Métricas principales - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricWidget
          title="Clientes Activos"
          value={stats.loading ? '...' : stats.totalClients}
          change={stats.totalClients > 0 ? `${stats.totalActiveCases} casos activos` : 'Sin casos activos'}
          changeType={stats.totalClients > 0 ? 'positive' : 'neutral'}
          icon={Users}
          description="Total de clientes registrados"
        />
        
        <MetricWidget
          title="Casos en Curso"
          value={stats.loading ? '...' : `${stats.totalActiveCases}/${stats.totalCases}`}
          change={stats.totalCases > stats.totalActiveCases ? 
            `${stats.totalCases - stats.totalActiveCases} archivados` : 
            'Todos activos'
          }
          changeType={stats.totalActiveCases > 0 ? 'positive' : 'neutral'}
          icon={FolderOpen}
          description="Expedientes activos vs total"
        />
        
        <MetricWidget
          title="Horas Facturables"
          value={stats.loading ? '...' : `${stats.totalBillableHours}h`}
          change={`${stats.hoursThisMonth}h este mes`}
          changeType={getChangeType(stats.hoursThisMonth, 160)} // ~20 días * 8h
          icon={Clock}
          progress={Math.min(stats.utilizationRate, 100)}
          description={`Utilización: ${stats.utilizationRate}%`}
        />
        
        <MetricWidget
          title="Tareas Pendientes"
          value={stats.loading ? '...' : stats.pendingTasks}
          change={stats.overdueTasks > 0 ? 
            `${stats.overdueTasks} vencidas` : 
            'Todas al día'
          }
          changeType={stats.overdueTasks > 0 ? 'negative' : 'positive'}
          icon={stats.overdueTasks > 0 ? AlertTriangle : CheckCircle}
          description="Tareas activas"
          className={stats.overdueTasks > 0 ? "border-orange-200" : "border-green-200"}
        />
      </div>

      {/* Métricas adicionales - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricWidget
          title="Promedio Diario"
          value={stats.loading ? '...' : `${stats.averageHoursPerDay}h`}
          change={stats.averageHoursPerDay >= 7 ? '+Excelente' : 
                   stats.averageHoursPerDay >= 5 ? 'Bueno' : 'Mejorable'}
          changeType={getChangeType(stats.averageHoursPerDay, 7)}
          icon={Target}
          progress={(stats.averageHoursPerDay / 8) * 100}
          description="Horas por día este mes"
        />
        
        <MetricWidget
          title="Ingresos Estimados"
          value={stats.loading ? '...' : `€${stats.totalRevenue.toLocaleString()}`}
          change={`${stats.hoursThisWeek}h esta semana`}
          changeType={stats.hoursThisWeek > 30 ? 'positive' : 'neutral'}
          icon={DollarSign}
          description="Basado en horas facturables"
        />

        <MetricWidget
          title="Eficiencia"
          value={stats.loading ? '...' : `${stats.utilizationRate}%`}
          change={stats.utilizationRate >= 80 ? 'Óptima' : 
                   stats.utilizationRate >= 60 ? 'Buena' : 'Mejorable'}
          changeType={getChangeType(stats.utilizationRate, 80)}
          icon={TrendingUp}
          progress={stats.utilizationRate}
          description="Tasa de utilización mensual"
        />
      </div>
    </>
  )
}
