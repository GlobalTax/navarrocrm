
import { 
  Users, 
  Briefcase, 
  Clock, 
  TrendingUp, 
  FileText, 
  CheckCircle,
  Euro,
  Target
} from 'lucide-react'
import { PremiumCard, PremiumCardContent, PremiumCardHeader } from '@/components/ui/premium-card'

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

const PremiumMetricCard = ({ title, value, change, changeType, icon: Icon, description }: MetricCardProps) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      default: return 'text-premium-tertiary'
    }
  }

  return (
    <PremiumCard className="premium-metric-card">
      <PremiumCardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-premium-gray-5 rounded-lg">
              <Icon className="h-4 w-4 text-premium-secondary" />
            </div>
            <span className="premium-metric-label">{title}</span>
          </div>
        </div>
      </PremiumCardHeader>
      <PremiumCardContent className="pt-0">
        <div className="premium-spacing-xs">
          <div className="premium-metric-value">{value}</div>
          {change && (
            <div className={`text-xs font-medium ${getChangeColor()}`}>
              {change}
            </div>
          )}
          {description && (
            <div className="premium-text-micro mt-1">{description}</div>
          )}
        </div>
      </PremiumCardContent>
    </PremiumCard>
  )
}

interface PremiumDashboardMetricsProps {
  data?: {
    totalClients: number
    activeCases: number
    totalHoursTracked: number
    monthlyRevenue: number
    pendingTasks: number
    completedTasks: number
    averageHourlyRate: number
    conversionRate: number
  }
}

export const PremiumDashboardMetrics = ({ data }: PremiumDashboardMetricsProps) => {
  const defaultData = {
    totalClients: 142,
    activeCases: 28,
    totalHoursTracked: 1847,
    monthlyRevenue: 45800,
    pendingTasks: 15,
    completedTasks: 89,
    averageHourlyRate: 125,
    conversionRate: 78.5
  }

  const metrics = data || defaultData

  const metricCards = [
    {
      title: "Clientes Totales",
      value: metrics.totalClients,
      change: "+12% vs mes anterior",
      changeType: "positive" as const,
      icon: Users,
      description: "Cartera activa"
    },
    {
      title: "Expedientes Activos",
      value: metrics.activeCases,
      change: "+3 esta semana",
      changeType: "positive" as const,
      icon: Briefcase,
      description: "En progreso"
    },
    {
      title: "Horas Registradas",
      value: `${metrics.totalHoursTracked}h`,
      change: "+8% vs mes pasado",
      changeType: "positive" as const,
      icon: Clock,
      description: "Este mes"
    },
    {
      title: "Facturación Mensual",
      value: `€${metrics.monthlyRevenue.toLocaleString()}`,
      change: "+15% vs objetivo",
      changeType: "positive" as const,
      icon: Euro,
      description: "Ingresos totales"
    },
    {
      title: "Tareas Pendientes",
      value: metrics.pendingTasks,
      change: "-5 desde ayer",
      changeType: "positive" as const,
      icon: FileText,
      description: "Por completar"
    },
    {
      title: "Tareas Completadas",
      value: metrics.completedTasks,
      change: "+23 esta semana",
      changeType: "positive" as const,
      icon: CheckCircle,
      description: "Finalizadas"
    },
    {
      title: "Tarifa Promedio",
      value: `€${metrics.averageHourlyRate}/h`,
      change: "+€5 vs mes pasado",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Por hora"
    },
    {
      title: "Tasa Conversión",
      value: `${metrics.conversionRate}%`,
      change: "+2.3% vs trimestre",
      changeType: "positive" as const,
      icon: Target,
      description: "Propuestas ganadas"
    }
  ]

  return (
    <div className="premium-spacing-md">
      <div className="mb-8">
        <h2 className="premium-text-title mb-2">Métricas Principales</h2>
        <p className="premium-text-caption">Vista general del rendimiento de tu despacho</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <div key={metric.title} className="premium-animate-in" style={{ animationDelay: `${index * 50}ms` }}>
            <PremiumMetricCard {...metric} />
          </div>
        ))}
      </div>
    </div>
  )
}
