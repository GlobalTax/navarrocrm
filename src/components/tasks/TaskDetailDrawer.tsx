
import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { TaskWithRelations } from '@/hooks/tasks/types'
import { 
  Calendar, 
  User, 
  FileText, 
  Clock, 
  Edit, 
  MessageSquare, 
  Paperclip,
  CheckSquare,
  Plus,
  Trash2,
  Scale,
  Gavel
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface TaskDetailDrawerProps {
  task: TaskWithRelations
  isOpen: boolean
  onClose: () => void
  onEdit: (task: TaskWithRelations) => void
}

export const TaskDetailDrawer = ({ task, isOpen, onClose, onEdit }: TaskDetailDrawerProps) => {
  const [newComment, setNewComment] = useState('')
  const [newSubtask, setNewSubtask] = useState('')

  if (!task) return null

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
          icon: Scale
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

  const handleAddComment = () => {
    if (!newComment.trim()) return
    // TODO: Implementar añadir comentario
    setNewComment('')
  }

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return
    // TODO: Implementar añadir subtarea
    setNewSubtask('')
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-lg font-semibold leading-tight pr-4">
                {task.title}
              </SheetTitle>
              {isCriticalDeadline && (
                <div className="flex items-center text-red-600 text-sm mt-2">
                  <Gavel className="h-4 w-4 mr-1" />
                  Plazo procesal crítico
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Estado y Prioridad */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {getLegalStatusLabel(task.status)}
            </Badge>
            <Badge className={priorityConfig.color}>
              <PriorityIcon className="h-3 w-3 mr-1" />
              {priorityConfig.label}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive">
                Vencida
              </Badge>
            )}
          </div>

          {/* Descripción */}
          {task.description && (
            <div>
              <h4 className="font-medium text-sm mb-2">Descripción</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Información básica */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {task.due_date && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <div className="text-gray-500">Fecha límite</div>
                  <div className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}>
                    {format(new Date(task.due_date), 'dd MMM yyyy', { locale: es })}
                  </div>
                </div>
              </div>
            )}

            {task.estimated_hours && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <div className="text-gray-500">Horas estimadas</div>
                  <div className="text-gray-900">{task.estimated_hours}h</div>
                </div>
              </div>
            )}

            {task.case && (
              <div className="flex items-center">
                <Gavel className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <div className="text-gray-500">Expediente</div>
                  <div className="text-gray-900 truncate">{task.case.title}</div>
                </div>
              </div>
            )}

            {task.task_assignments && task.task_assignments.length > 0 && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <div className="text-gray-500">Asignado a</div>
                  <div className="text-gray-900 truncate">
                    {task.task_assignments[0]?.user?.email || 'Usuario desconocido'}
                    {task.task_assignments.length > 1 && ` +${task.task_assignments.length - 1}`}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Subtareas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm flex items-center">
                <CheckSquare className="h-4 w-4 mr-2" />
                Subtareas
              </h4>
            </div>
            
            <div className="space-y-2">
              {/* Lista de subtareas existentes */}
              {task.subtasks?.map(subtask => (
                <div key={subtask.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => {/* TODO: toggle subtask */}}
                    className="rounded"
                  />
                  <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {subtask.title}
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {/* Añadir nueva subtarea */}
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Añadir subtarea..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                  className="text-sm"
                />
                <Button variant="outline" size="sm" onClick={handleAddSubtask}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Comentarios */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comentarios
              </h4>
            </div>
            
            <div className="space-y-3">
              {/* Lista de comentarios existentes */}
              {task.comments?.map(comment => (
                <div key={comment.id} className="p-3 bg-gray-50 rounded text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">Usuario</span>
                    <span className="text-gray-500 text-xs">
                      {format(new Date(comment.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}

              {/* Añadir nuevo comentario */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Añadir comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="text-sm"
                  rows={3}
                />
                <Button variant="outline" size="sm" onClick={handleAddComment}>
                  Añadir comentario
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Adjuntos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm flex items-center">
                <Paperclip className="h-4 w-4 mr-2" />
                Adjuntos
              </h4>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Subir archivo
              </Button>
            </div>
            
            <div className="text-sm text-gray-500">
              No hay archivos adjuntos
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
