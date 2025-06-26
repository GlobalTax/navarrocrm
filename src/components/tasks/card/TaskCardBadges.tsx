
import { Badge } from '@/components/ui/badge'

interface TaskCardBadgesProps {
  priority: string
  status: string
}

export const TaskCardBadges = ({ priority, status }: TaskCardBadgesProps) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high': return { color: 'bg-red-100 text-red-800 border-red-200', label: '🔴 Alta' }
      case 'medium': return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: '🟡 Media' }
      case 'low': return { color: 'bg-green-100 text-green-800 border-green-200', label: '🟢 Baja' }
      default: return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: priority || 'Sin prioridad' }
    }
  }

  const getStatusColor = (status: string) => {
    const statusMapping: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'investigation': 'bg-blue-100 text-blue-800',
      'drafting': 'bg-blue-100 text-blue-800',
      'review': 'bg-blue-100 text-blue-800',
      'filing': 'bg-blue-100 text-blue-800',
      'hearing': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    }
    return statusMapping[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const statusLabels: { [key: string]: string } = {
      'pending': 'Por Hacer',
      'in_progress': 'En Curso',
      'completed': 'Completada',
      'investigation': 'En Curso',
      'drafting': 'En Curso',
      'review': 'En Curso',
      'filing': 'En Curso',
      'hearing': 'En Curso',
      'cancelled': 'Cancelada'
    }
    return statusLabels[status] || status
  }

  const priorityConfig = getPriorityConfig(priority)

  return (
    <div className="space-y-2 mb-3">
      <Badge className={`${priorityConfig.color} text-xs`}>
        {priorityConfig.label}
      </Badge>
      
      <Badge className={`${getStatusColor(status)} text-xs`}>
        {getStatusLabel(status)}
      </Badge>
    </div>
  )
}
