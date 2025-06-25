
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
import { Card, CardContent } from '@/components/ui/card'
import { useDashboardData } from '@/hooks/useDashboardData'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: string
    type: 'positive' | 'negative' | 'neutral'
  }
  className?: string
}

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, className }: MetricCardProps) => {
  const getTrendColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          {trend && (
            <span className={`text-sm font-medium ${getTrendColor(trend.type)}`}>
              {trend.value}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

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
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                <div className="w-12 h-4 bg-gray-200 rounded" />
              </div>
              <div className="space-y-2">
                <div className="w-16 h-8 bg-gray-200 rounded" />
                <div className="w-24 h-4 bg-gray-200 rounded" />
                <div className="w-20 h-3 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const quickStats = dashboardData?.quickStats
  const performanceData = dashboardData?.performanceData || []
  
  // Calcular métricas derivadas
  const currentMonth = performanceData[performanceData.length - 1]
  const monthlyTarget = currentMonth?.objetivo || 160
  const monthlyHours = currentMonth?.horas || quickStats?.monthHours || 0
  const utilizationRate = monthlyTarget > 0 ? Math.round((monthlyHours / monthlyTarget) * 100) : 0
  
  const metrics = [
    {
      title: 'Horas Hoy',
      value: quickStats?.todayHours || 0,
      subtitle: 'Tiempo registrado',
      icon: Calendar,
      trend: {
        value: quickStats?.todayHours && quickStats.todayHours >= 6 ? '+bueno' : 'continúa',
        type: (quickStats?.todayHours && quickStats.todayHours >= 6 ? 'positive' : 'neutral') as const
      }
    },
    {
      title: 'Esta Semana',
      value: `${quickStats?.weekHours || 0}h`,
      subtitle: 'Progreso semanal',
      icon: Target,
      trend: {
        value: `${Math.round((quickStats?.weekHours || 0) / 40 * 100)}%`,
        type: ((quickStats?.weekHours || 0) > 30 ? 'positive' : 'neutral') as const
      }
    },
    {
      title: 'Este Mes',
      value: `${monthlyHours}h`,
      subtitle: `Objetivo: ${monthlyTarget}h`,
      icon: TrendingUp,
      trend: {
        value: `${utilizationRate}%`,
        type: (utilizationRate >= 80 ? 'positive' : utilizationRate >= 60 ? 'neutral' : 'negative') as const
      }
    },
    {
      title: 'Clientes Activos',
      value: quickStats?.activeClients || 0,
      subtitle: 'Clientes con casos abiertos',
      icon: Users,
      trend: {
        value: quickStats?.activeClients ? '+activos' : 'sin actividad',
        type: (quickStats?.activeClients ? 'positive' : 'neutral') as const
      }
    },
    {
      title: 'Casos Activos',
      value: dashboardData?.upcomingTasks?.length || 0,
      subtitle: 'Expedientes en curso',
      icon: FolderOpen,
      trend: {
        value: 'en progreso',
        type: 'neutral' as const
      }
    },
    {
      title: 'Tareas Pendientes',
      value: dashboardData?.upcomingTasks?.length || 0,
      subtitle: 'Por completar',
      icon: CheckCircle,
      trend: {
        value: dashboardData?.upcomingTasks?.some(task => new Date(task.dueDate) < new Date()) ? 'vencidas' : 'al día',
        type: (dashboardData?.upcomingTasks?.some(task => new Date(task.dueDate) < new Date()) ? 'negative' : 'positive') as const
      }
    },
    {
      title: 'Facturación',
      value: `€${((monthlyHours || 0) * 75).toLocaleString()}`,
      subtitle: 'Estimado mensual',
      icon: DollarSign,
      trend: {
        value: monthlyHours > 100 ? '+objetivo' : 'por debajo',
        type: (monthlyHours > 100 ? 'positive' : 'neutral') as const
      }
    },
    {
      title: 'Productividad',
      value: `${utilizationRate}%`,
      subtitle: 'Eficiencia mensual',
      icon: Clock,
      trend: {
        value: utilizationRate >= 80 ? 'excelente' : utilizationRate >= 60 ? 'buena' : 'mejorable',
        type: (utilizationRate >= 80 ? 'positive' : utilizationRate >= 60 ? 'neutral' : 'negative') as const
      }
    }
  ]

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
