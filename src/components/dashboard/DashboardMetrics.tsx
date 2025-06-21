
import { 
  Clock, 
  Users, 
  FolderOpen, 
  AlertTriangle,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import { MetricWidget } from './MetricWidget'
import { ActiveTimer } from './ActiveTimer'

interface DashboardStats {
  totalTimeEntries: number
  totalBillableHours: number
  totalClients: number
  totalCases: number
  pendingInvoices: number
  hoursThisWeek: number
  utilizationRate: number
  loading: boolean
  error: string | null
}

interface DashboardMetricsProps {
  stats: DashboardStats
}

export const DashboardMetrics = ({ stats }: DashboardMetricsProps) => {
  return (
    <>
      {/* Timer activo */}
      <ActiveTimer />

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricWidget
          title="Clientes Activos"
          value={stats.loading ? '...' : stats.totalClients}
          change="+2 este mes"
          changeType="positive"
          icon={Users}
          description="Total de clientes registrados"
        />
        
        <MetricWidget
          title="Casos Abiertos"
          value={stats.loading ? '...' : stats.totalCases}
          change="3 nuevos esta semana"
          changeType="positive"
          icon={FolderOpen}
          description="Expedientes en curso"
        />
        
        <MetricWidget
          title="Horas Facturables"
          value={stats.loading ? '...' : `${stats.totalBillableHours}h`}
          change={`${stats.hoursThisWeek}h esta semana`}
          changeType="positive"
          icon={Clock}
          progress={stats.utilizationRate}
          description="Este mes"
        />
        
        <MetricWidget
          title="Facturas Pendientes"
          value={stats.pendingInvoices}
          change="2 vencen pronto"
          changeType="negative"
          icon={AlertTriangle}
          description="Requieren atención"
          className="border-orange-200"
        />
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-2 gap-4">
        <MetricWidget
          title="Tasa Utilización"
          value={`${stats.utilizationRate}%`}
          change="+5% vs mes anterior"
          changeType="positive"
          icon={TrendingUp}
          progress={stats.utilizationRate}
        />
        
        <MetricWidget
          title="Ingresos Mes"
          value="€12,480"
          change="+8.2%"
          changeType="positive"
          icon={DollarSign}
          description="Facturación actual"
        />
      </div>
    </>
  )
}
