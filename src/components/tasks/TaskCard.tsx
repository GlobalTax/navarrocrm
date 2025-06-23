
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, Edit, MessageSquare, CheckSquare, Users } from 'lucide-react'
import { format, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'

interface TaskCardProps {
  task: any
  onEdit: () => void
  onStatusChange?: (newStatus: string) => void
  showStatusSelector?: boolean
}

export const TaskCard = ({ task, onEdit, onStatusChange, showStatusSelector = false }: TaskCardProps) => {
  if (!task || !task.id) return null

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

  const formatSmartDate = (dateString: string | null) => {
    if (!dateString) return { text: 'Sin fecha', color: 'text-gray-400' }
    
    const date = new Date(dateString)
    const now = new Date()
    const isOverdue = date < now && task.status !== 'completed'
    
    if (isToday(date)) return { text: 'Hoy', color: isOverdue ? 'text-red-600' : 'text-blue-600' }
    if (isTomorrow(date)) return { text: 'Mañana', color: 'text-green-600' }
    
    return { 
      text: format(date, 'dd/MM', { locale: es }), 
      color: isOverdue ? 'text-red-600' : 'text-gray-600' 
    }
  }

  const priorityConfig = getPriorityConfig(task.priority)
  const smartDate = formatSmartDate(task.due_date)
  
  // Contadores para elementos relacionados
  const subtasksCount = task.subtasks?.length || 0
  const completedSubtasks = task.subtasks?.filter((st: any) => st.completed).length || 0
  const commentsCount = task.comments?.length || 0
  const assignedUsers = task.task_assignments || []

  const getUserInitials = (email: string) => {
    if (!email) return '?'
    const parts = email.split('@')[0].split('.')
    return parts.map(part => part[0]?.toUpperCase()).join('').slice(0, 2)
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
            {task.title || 'Sin título'}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="space-y-2 mb-3">
          <Badge className={`${priorityConfig.color} text-xs`}>
            {priorityConfig.label}
          </Badge>
          
          <Badge className={`${getStatusColor(task.status)} text-xs`}>
            {getStatusLabel(task.status)}
          </Badge>
        </div>

        {task.due_date && (
          <div className="flex items-center text-sm mb-3">
            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
            <span className={smartDate.color}>
              {smartDate.text}
            </span>
          </div>
        )}

        {/* Usuarios asignados */}
        {assignedUsers.length > 0 && (
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <Users className="h-4 w-4 mr-1" />
            <div className="flex items-center space-x-1">
              {assignedUsers.slice(0, 2).map((assignment: any, index: number) => (
                <Avatar key={assignment.user_id || index} className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                    {getUserInitials(assignment.user?.email || '')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {assignedUsers.length > 2 && (
                <span className="text-xs text-gray-400">
                  +{assignedUsers.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t">
          <div className="flex items-center space-x-3">
            {subtasksCount > 0 && (
              <div className="flex items-center">
                <CheckSquare className="h-3 w-3 mr-1" />
                <span>{completedSubtasks}/{subtasksCount}</span>
              </div>
            )}
            {commentsCount > 0 && (
              <div className="flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span>{commentsCount}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
