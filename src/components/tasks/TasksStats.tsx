
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Clock, AlertTriangle, Target, Play } from 'lucide-react'

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
  const safeStats = stats || {
    total_tasks: 0,
    pending_tasks: 0,
    in_progress_tasks: 0,
    completed_tasks: 0,
    overdue_tasks: 0,
    high_priority_tasks: 0
  }

  const statItems = [
    {
      label: 'Total',
      value: safeStats.total_tasks,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Pendientes',
      value: safeStats.pending_tasks,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'En Curso',
      value: safeStats.in_progress_tasks,
      icon: Play,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Completadas',
      value: safeStats.completed_tasks,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Vencidas',
      value: safeStats.overdue_tasks,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statItems.map((item) => {
        const IconComponent = item.icon
        
        return (
          <Card key={item.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-sm font-medium text-gray-600">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
