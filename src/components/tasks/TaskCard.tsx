
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, User, FileText, Clock, Edit, AlertTriangle, Scale, Gavel, MessageSquare, CheckSquare } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface TaskCardProps {
  task: any
  onEdit: () => void
  onStatusChange?: (newStatus: string) => void
  showStatusSelector?: boolean
}

export const TaskCard = ({ task, onEdit, onStatusChange, showStatusSelector = false }: TaskCardProps) => {
  if (!task || !task.id) {
    console.warn('⚠️ TaskCard received invalid task')
    return null
  }

  const getLegalPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'critical': 
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          label: 'Vencimiento Crítico',
          icon: Scale
        }
      case 'urgent': 
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          label: 'Urgente (24-48h)',
          icon: AlertTriangle
        }
      case 'high': 
        return { 
          color: 'bg-orange-100 text-orange-800 border-orange-200', 
          label: 'Alta (esta semana)',
          icon: Clock
        }
      case 'medium': 
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
          label: 'Normal (este mes)',
          icon: FileText
        }
      case 'low': 
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          label: 'Baja',
          icon: FileText
        }
      default: 
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          label: priority || 'Sin prioridad',
          icon: FileText
        }
    }
  }

  const getLegalStatusColor = (status: string) => {
    const statusMapping: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'investigation': 'bg-blue-100 text-blue-800',
      'drafting': 'bg-purple-100 text-purple-800',
      'review': 'bg-orange-100 text-orange-800',
      'filing': 'bg-green-100 text-green-800',
      'hearing': 'bg-red-100 text-red-800',
      'completed': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-gray-300 text-gray-700'
    }
    return statusMapping[status] || 'bg-gray-100 text-gray-800'
  }

  const getLegalStatusLabel = (status: string) => {
    const statusLabels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'investigation': 'Investigación',
      'drafting': 'Redacción',
      'review': 'Revisión',
      'filing': 'Presentación',
      'hearing': 'Audiencia',
      'completed': 'Completada',
      'in_progress': 'En Proceso',
      'cancelled': 'Cancelada'
    }
    return statusLabels[status] || status
  }

  const priorityConfig = getLegalPriorityConfig(task.priority)
  const PriorityIcon = priorityConfig.icon
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  const isCriticalDeadline = task.priority === 'critical' || task.priority === 'urgent'

  // Contadores para elementos relacionados
  const subtasksCount = task.subtasks?.length || 0
  const completedSubtasks = task.subtasks?.filter((st: any) => st.completed).length || 0
  const commentsCount = task.comments?.length || 0

  return (
    <Card className={`hover:shadow-md transition-shadow cursor-pointer group ${isCriticalDeadline ? 'ring-1 ring-red-200' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm leading-tight">
              {task.title || 'Sin título'}
            </h4>
            {isCriticalDeadline && (
              <div className="flex items-center text-red-600 text-xs mt-1">
                <Gavel className="h-3 w-3 mr-1" />
                Plazo procesal crítico
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>

        {task.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <Badge className={`${priorityConfig.color} text-xs px-2 py-0.5`}>
              <PriorityIcon className="h-3 w-3 mr-1" />
              {priorityConfig.label}
            </Badge>
            
            {isOverdue && (
              <div className="flex items-center text-red-600 text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Vencida
              </div>
            )}
          </div>

          {showStatusSelector && onStatusChange ? (
            <Select value={task.status} onValueChange={onStatusChange}>
              <SelectTrigger className="h-6 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="investigation">Investigación</SelectItem>
                <SelectItem value="drafting">Redacción</SelectItem>
                <SelectItem value="review">Revisión</SelectItem>
                <SelectItem value="filing">Presentación</SelectItem>
                <SelectItem value="hearing">Audiencia</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge className={`${getLegalStatusColor(task.status)} text-xs`}>
              {getLegalStatusLabel(task.status)}
            </Badge>
          )}
        </div>

        {task.due_date && (
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <Calendar className="h-3 w-3 mr-1" />
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              {format(new Date(task.due_date), 'dd MMM yyyy', { locale: es })}
            </span>
          </div>
        )}

        {task.task_assignments && Array.isArray(task.task_assignments) && task.task_assignments.length > 0 && (
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <User className="h-3 w-3 mr-1" />
            <span className="truncate">
              {task.task_assignments[0]?.user?.email || 'Usuario desconocido'}
            </span>
            {task.task_assignments.length > 1 && (
              <span className="ml-1">+{task.task_assignments.length - 1}</span>
            )}
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
            <div className="flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              <span>0 docs</span>
            </div>
          </div>
          
          {task.case && (
            <div className="flex items-center">
              <Gavel className="h-3 w-3 mr-1" />
              <span className="truncate max-w-20">{task.case.title || 'Sin título'}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
