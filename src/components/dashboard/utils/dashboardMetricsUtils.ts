
import { 
  Clock, 
  Users, 
  FolderOpen, 
  CheckCircle,
  TrendingUp,
  DollarSign,
  Target,
  Calendar
} from 'lucide-react'
import { MetricCardProps } from '../types/MetricCardTypes'

interface QuickStats {
  todayHours: number
  weekHours: number
  monthHours: number
  activeClients: number
}

interface PerformanceData {
  month: string
  horas: number
  facturado: number
  objetivo: number
}

interface DashboardData {
  quickStats?: QuickStats
  performanceData?: PerformanceData[]
  upcomingTasks?: Array<{
    id: string
    title: string
    dueDate: Date
    priority: 'low' | 'medium' | 'high' | 'urgent'
    case?: string
  }>
}

export const calculateMetrics = (dashboardData: DashboardData | undefined): Omit<MetricCardProps, 'className'>[] => {
  const quickStats = dashboardData?.quickStats
  const performanceData = dashboardData?.performanceData || []
  
  // Calcular métricas derivadas
  const currentMonth = performanceData[performanceData.length - 1]
  const monthlyTarget = currentMonth?.objetivo || 160
  const monthlyHours = currentMonth?.horas || quickStats?.monthHours || 0
  const utilizationRate = monthlyTarget > 0 ? Math.round((monthlyHours / monthlyTarget) * 100) : 0
  
  return [
    {
      title: 'Horas Hoy',
      value: quickStats?.todayHours || 0,
      subtitle: 'Tiempo registrado',
      icon: Calendar,
      trend: {
        value: quickStats?.todayHours && quickStats.todayHours >= 6 ? '+bueno' : 'continúa',
        type: quickStats?.todayHours && quickStats.todayHours >= 6 ? 'positive' : 'neutral'
      }
    },
    {
      title: 'Esta Semana',
      value: `${quickStats?.weekHours || 0}h`,
      subtitle: 'Progreso semanal',
      icon: Target,
      trend: {
        value: `${Math.round((quickStats?.weekHours || 0) / 40 * 100)}%`,
        type: (quickStats?.weekHours || 0) > 30 ? 'positive' : 'neutral'
      }
    },
    {
      title: 'Este Mes',
      value: `${monthlyHours}h`,
      subtitle: `Objetivo: ${monthlyTarget}h`,
      icon: TrendingUp,
      trend: {
        value: `${utilizationRate}%`,
        type: utilizationRate >= 80 ? 'positive' : utilizationRate >= 60 ? 'neutral' : 'negative'
      }
    },
    {
      title: 'Clientes Activos',
      value: quickStats?.activeClients || 0,
      subtitle: 'Clientes con casos abiertos',
      icon: Users,
      trend: {
        value: quickStats?.activeClients ? '+activos' : 'sin actividad',
        type: quickStats?.activeClients ? 'positive' : 'neutral'
      }
    },
    {
      title: 'Casos Activos',
      value: dashboardData?.upcomingTasks?.length || 0,
      subtitle: 'Expedientes en curso',
      icon: FolderOpen,
      trend: {
        value: 'en progreso',
        type: 'neutral'
      }
    },
    {
      title: 'Tareas Pendientes',
      value: dashboardData?.upcomingTasks?.length || 0,
      subtitle: 'Por completar',
      icon: CheckCircle,
      trend: {
        value: dashboardData?.upcomingTasks?.some(task => new Date(task.dueDate) < new Date()) ? 'vencidas' : 'al día',
        type: dashboardData?.upcomingTasks?.some(task => new Date(task.dueDate) < new Date()) ? 'negative' : 'positive'
      }
    },
    {
      title: 'Facturación',
      value: `€${((monthlyHours || 0) * 75).toLocaleString()}`,
      subtitle: 'Estimado mensual',
      icon: DollarSign,
      trend: {
        value: monthlyHours > 100 ? '+objetivo' : 'por debajo',
        type: monthlyHours > 100 ? 'positive' : 'neutral'
      }
    },
    {
      title: 'Productividad',
      value: `${utilizationRate}%`,
      subtitle: 'Eficiencia mensual',
      icon: Clock,
      trend: {
        value: utilizationRate >= 80 ? 'excelente' : utilizationRate >= 60 ? 'buena' : 'mejorable',
        type: utilizationRate >= 80 ? 'positive' : utilizationRate >= 60 ? 'neutral' : 'negative'
      }
    }
  ]
}
