import { Card, CardContent } from '@/components/ui/card'
import { Shield, Clock, Activity, AlertTriangle } from 'lucide-react'

interface UserStats {
  total: number
  active: number
  partners: number
  managers: number
  seniors: number
  juniors: number
}

interface SystemUserMetricsProps {
  stats: UserStats
}

export const SystemUserMetrics = ({ stats }: SystemUserMetricsProps) => {
  const systemMetrics = [
    { 
      label: 'Total del Sistema', 
      value: stats.total, 
      color: 'text-foreground',
      icon: Shield,
      description: 'Usuarios registrados'
    },
    { 
      label: 'Activos', 
      value: stats.active, 
      color: 'text-green-600',
      icon: Activity,
      description: 'Usuarios activos'
    },
    { 
      label: 'Administradores', 
      value: stats.partners + stats.managers, 
      color: 'text-purple-600',
      icon: Shield,
      description: 'Partners + Managers'
    },
    { 
      label: 'Staff Técnico', 
      value: stats.seniors, 
      color: 'text-blue-600',
      icon: Clock,
      description: 'Usuarios senior'
    },
    { 
      label: 'Staff Junior', 
      value: stats.juniors, 
      color: 'text-emerald-600',
      icon: Activity,
      description: 'Usuarios junior'
    },
    { 
      label: 'Inactivos', 
      value: stats.total - stats.active, 
      color: 'text-red-600',
      icon: AlertTriangle,
      description: 'Usuarios desactivados'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      {systemMetrics.map((metric, index) => {
        const IconComponent = metric.icon
        return (
          <Card key={index} className="border-0.5 border-black rounded-[10px] hover-lift transition-all duration-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <IconComponent className={`h-5 w-5 ${metric.color}`} />
              </div>
              <div className={`text-2xl font-semibold ${metric.color} animate-fade-in`}>
                {metric.value}
              </div>
              <div className="text-sm text-muted-foreground">{metric.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{metric.description}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}