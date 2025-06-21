
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Clock, AlertTriangle, Target, Scale, Gavel, FileText, Calendar } from 'lucide-react'

interface TasksStatsProps {
  stats?: {
    total_tasks: number
    pending_tasks: number
    in_progress_tasks: number
    completed_tasks: number
    overdue_tasks: number
    high_priority_tasks: number
  }
}

export const TasksStats = ({ stats }: TasksStatsProps) => {
  console.log('🔍 TasksStats received stats:', stats)
  
  const safeStats = stats || {
    total_tasks: 0,
    pending_tasks: 0,
    in_progress_tasks: 0,
    completed_tasks: 0,
    overdue_tasks: 0,
    high_priority_tasks: 0
  }

  const legalStatItems = [
    {
      label: 'Total Gestiones',
      value: safeStats.total_tasks,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Todas las tareas activas'
    },
    {
      label: 'Pendientes',
      value: safeStats.pending_tasks,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Por asignar o iniciar'
    },
    {
      label: 'En Proceso',
      value: safeStats.in_progress_tasks,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Investigación y redacción'
    },
    {
      label: 'Completadas',
      value: safeStats.completed_tasks,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Gestiones finalizadas'
    },
    {
      label: 'Vencimientos',
      value: safeStats.overdue_tasks,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Plazos vencidos'
    },
    {
      label: 'Críticas',
      value: safeStats.high_priority_tasks,
      icon: Scale,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Urgencia alta/crítica'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {legalStatItems.map((item) => {
        const IconComponent = item.icon
        
        if (!IconComponent || typeof IconComponent !== 'function') {
          console.warn('⚠️ Invalid icon component for:', item.label)
          return (
            <Card key={item.label}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <div className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{item.value}</p>
                    <p className="text-xs text-gray-600">{item.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        }
        
        return (
          <Card key={item.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs font-medium text-gray-700">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
