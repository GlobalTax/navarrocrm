
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, User, MessageSquare, Paperclip, Edit, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface TaskCardProps {
  task: any
  onEdit: () => void
}

export const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  // Validación robusta de datos
  if (!task) {
    console.warn('⚠️ TaskCard received undefined task')
    return null
  }

  if (!task.id) {
    console.warn('⚠️ TaskCard received task without id:', task)
    return null
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente'
      case 'high': return 'Alta'
      case 'medium': return 'Media'
      case 'low': return 'Baja'
      default: return priority || 'Sin prioridad'
    }
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            {task.title || 'Sin título'}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <Badge className={getPriorityColor(task.priority)}>
            {getPriorityLabel(task.priority)}
          </Badge>
          
          {isOverdue && (
            <div className="flex items-center text-red-600 text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Vencida
            </div>
          )}
        </div>

        {task.due_date && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Calendar className="h-4 w-4 mr-1" />
            {format(new Date(task.due_date), 'dd MMM yyyy', { locale: es })}
          </div>
        )}

        {task.task_assignments && Array.isArray(task.task_assignments) && task.task_assignments.length > 0 && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <User className="h-4 w-4 mr-1" />
            {task.task_assignments[0]?.user?.email || 'Usuario desconocido'}
            {task.task_assignments.length > 1 && (
              <span className="ml-1">+{task.task_assignments.length - 1}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <MessageSquare className="h-3 w-3 mr-1" />
              0
            </div>
            <div className="flex items-center">
              <Paperclip className="h-3 w-3 mr-1" />
              0
            </div>
          </div>
          
          {task.case && (
            <span>Caso: {task.case.title || 'Sin título'}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
