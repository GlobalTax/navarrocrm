
import { 
  Clock, 
  Users, 
  FolderOpen, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Target,
  CheckCircle,
  Calendar
} from 'lucide-react'
import { MetricWidget } from './MetricWidget'
import { EnhancedActiveTimer } from './EnhancedActiveTimer'
import { useDashboardData } from '@/hooks/useDashboardData'

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
  const { data: dashboardData } = useDashboardData()
  
  // Calcular cambios y tendencias
  const getChangeType = (value: number, threshold: number) => {
    if (value >= threshold) return 'positive'
    if (value >= threshold * 0.8) return 'neutral'
    return 'negative'
  }

  const quickStats = dashboardData?.quickStats

  return (
    <>
      {/* Timer activo mejorado */}
      <EnhancedActiveTimer />

      {/* Métricas principales - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricWidget
          title="Clientes Activos"
          value={stats.loading ? '...' : (stats.totalClients || 0).toString()}
          change={stats.totalClients > 0 ? `${stats.totalActiveCases} casos activos` : 'Sin casos activos'}
          changeType={stats.totalClients > 0 ? 'positive' : 'neutral'}
          icon={Users}
          description="Total de clientes registrados"
        />
        
        <MetricWidget
          title="Casos en Curso"
          value={stats.loading ? '...' : `${stats.totalActiveCases || 0}/${stats.totalCases || 0}`}
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
          value={stats.loading ? '...' : `${stats.totalBillableHours || 0}h`}
          change={`${stats.hoursThisMonth || 0}h este mes`}
          changeType={getChangeType(stats.hoursThisMonth || 0, 160)} // ~20 días * 8h
          icon={Clock}
          progress={Math.min(stats.utilizationRate || 0, 100)}
          description={`Utilización: ${stats.utilizationRate || 0}%`}
        />
        
        <MetricWidget
          title="Tareas Pendientes"
          value={stats.loading ? '...' : (stats.pendingTasks || 0).toString()}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricWidget
          title="Hoy"
          value={stats.loading ? '...' : `${quickStats?.todayHours || 0}h`}
          change="Tiempo registrado hoy"
          changeType={quickStats?.todayHours && quickStats.todayHours >= 6 ? 'positive' : 'neutral'}
          icon={Calendar}
          description="Horas trabajadas hoy"
        />
        
        <MetricWidget
          title="Esta Semana"
          value={stats.loading ? '...' : `${quickStats?.weekHours || 0}h`}
          change={quickStats?.weekHours && quickStats.weekHours > 30 ? 'Excelente' : 'Continúa así'}
          changeType={quickStats?.weekHours && quickStats.weekHours > 30 ? 'positive' : 'neutral'}
          icon={Target}
          progress={quickStats?.weekHours ? (quickStats.weekHours / 40) * 100 : 0}
          description="Progreso semanal"
        />
        
        <MetricWidget
          title="Ingresos Estimados"
          value={stats.loading ? '...' : `€${(stats.totalRevenue || 0).toLocaleString()}`}
          change={`${stats.hoursThisWeek || 0}h esta semana`}
          changeType={(stats.hoursThisWeek || 0) > 30 ? 'positive' : 'neutral'}
          icon={DollarSign}
          description="Basado en horas facturables"
        />

        <MetricWidget
          title="Eficiencia"
          value={stats.loading ? '...' : `${stats.utilizationRate || 0}%`}
          change={(stats.utilizationRate || 0) >= 80 ? 'Óptima' : 
                   (stats.utilizationRate || 0) >= 60 ? 'Buena' : 'Mejorable'}
          changeType={getChangeType(stats.utilizationRate || 0, 80)}
          icon={TrendingUp}
          progress={stats.utilizationRate || 0}
          description="Tasa de utilización mensual"
        />
      </div>
    </>
  )
}
