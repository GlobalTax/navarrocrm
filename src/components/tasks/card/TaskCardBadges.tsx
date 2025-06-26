
import { Badge } from '@/components/ui/badge'

interface TaskCardBadgesProps {
  priority: string
  status: string
}

export const TaskCardBadges = ({ priority, status }: TaskCardBadgesProps) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high': return { color: 'capittal-badge bg-red-50 text-red-800 border-red-200', label: '🔴 Alta' }
      case 'medium': return { color: 'capittal-badge bg-yellow-50 text-yellow-800 border-yellow-200', label: '🟡 Media' }
      case 'low': return { color: 'capittal-badge bg-green-50 text-green-800 border-green-200', label: '🟢 Baja' }
      default: return { color: 'capittal-badge-secondary', label: priority || 'Sin prioridad' }
    }
  }

  const getStatusConfig = (status: string) => {
    const statusMapping: { [key: string]: { color: string, label: string } } = {
      'pending': { color: 'capittal-badge bg-yellow-50 text-yellow-800', label: 'Por Hacer' },
      'in_progress': { color: 'capittal-badge bg-blue-50 text-blue-800', label: 'En Curso' },
      'completed': { color: 'capittal-badge bg-green-50 text-green-800', label: 'Completada' },
      'investigation': { color: 'capittal-badge bg-blue-50 text-blue-800', label: 'En Curso' },
      'drafting': { color: 'capittal-badge bg-blue-50 text-blue-800', label: 'En Curso' },
      'review': { color: 'capittal-badge bg-blue-50 text-blue-800', label: 'En Curso' },
      'filing': { color: 'capittal-badge bg-blue-50 text-blue-800', label: 'En Curso' },
      'hearing': { color: 'capittal-badge bg-blue-50 text-blue-800', label: 'En Curso' },
      'cancelled': { color: 'capittal-badge-secondary', label: 'Cancelada' }
    }
    return statusMapping[status] || { color: 'capittal-badge-secondary', label: status }
  }

  const priorityConfig = getPriorityConfig(priority)
  const statusConfig = getStatusConfig(status)

  return (
    <div className="space-y-2 mb-3">
      <Badge className={`${priorityConfig.color} text-xs capittal-radius`}>
        {priorityConfig.label}
      </Badge>
      
      <Badge className={`${statusConfig.color} text-xs capittal-radius`}>
        {statusConfig.label}
      </Badge>
    </div>
  )
}
