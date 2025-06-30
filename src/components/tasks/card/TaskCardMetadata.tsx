
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, User, MessageSquare, CheckSquare, Briefcase, UserCheck } from 'lucide-react'
import { TaskAssignment, TaskSubtask, TaskComment } from '@/hooks/tasks/types'

interface TaskCardMetadataProps {
  dueDate?: string | null
  taskStatus: string
  assignedUsers: (TaskAssignment & {
    user?: { email: string; role: string }
  })[]
  subtasks: TaskSubtask[]
  comments: TaskComment[]
  caseName?: string | null
  contactName?: string | null
}

export const TaskCardMetadata = ({ 
  dueDate, 
  taskStatus, 
  assignedUsers, 
  subtasks, 
  comments, 
  caseName, 
  contactName 
}: TaskCardMetadataProps) => {
  
  // Calcular estadísticas de subtareas de forma segura
  const completedSubtasks = subtasks.filter(st => st.completed).length
  const totalSubtasks = subtasks.length
  
  // Verificar si la tarea está vencida
  const isOverdue = dueDate && new Date(dueDate) < new Date() && taskStatus !== 'completed'

  return (
    <div className="space-y-2">
      {/* Fecha de vencimiento */}
      {dueDate && (
        <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
          <Clock className="h-3 w-3" />
          <span>
            {format(new Date(dueDate), 'dd MMM yyyy', { locale: es })}
            {isOverdue && ' (Vencida)'}
          </span>
        </div>
      )}

      {/* Información del caso o contacto */}
      {caseName && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Briefcase className="h-3 w-3" />
          <span className="truncate">{caseName}</span>
        </div>
      )}

      {contactName && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <UserCheck className="h-3 w-3" />
          <span className="truncate">{contactName}</span>
        </div>
      )}

      {/* Usuarios asignados - corregido para usar la estructura correcta */}
      {assignedUsers.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <User className="h-3 w-3" />
          <span>
            {assignedUsers.length === 1 
              ? assignedUsers[0].user?.email || 'Usuario'
              : `${assignedUsers.length} asignados`
            }
          </span>
        </div>
      )}

      {/* Progreso de subtareas */}
      {totalSubtasks > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <CheckSquare className="h-3 w-3" />
          <span>
            {completedSubtasks}/{totalSubtasks} subtareas
          </span>
        </div>
      )}

      {/* Número de comentarios */}
      {comments.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MessageSquare className="h-3 w-3" />
          <span>{comments.length} comentarios</span>
        </div>
      )}
    </div>
  )
}
