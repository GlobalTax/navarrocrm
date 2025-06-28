
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, CheckSquare, MessageSquare, FileText, User } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface TaskCardMetadataProps {
  dueDate?: string | null
  taskStatus: string
  assignedUsers?: any[]
  subtasks?: any[]
  comments?: any[]
  caseName?: string | null
  contactName?: string | null
}

export const TaskCardMetadata = ({ 
  dueDate, 
  taskStatus, 
  assignedUsers = [], 
  subtasks = [], 
  comments = [],
  caseName,
  contactName
}: TaskCardMetadataProps) => {
  const completedSubtasks = subtasks.filter(s => s.completed).length
  const isOverdue = dueDate && new Date(dueDate) < new Date() && taskStatus !== 'completed'

  return (
    <div className="mt-3 space-y-2">
      {/* Fecha de vencimiento */}
      {dueDate && (
        <div className="flex items-center gap-1 text-xs">
          <Calendar className="h-3 w-3" />
          <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}>
            {format(new Date(dueDate), 'dd MMM yyyy', { locale: es })}
          </span>
          {isOverdue && <Badge variant="destructive" className="text-xs px-1 py-0">Vencida</Badge>}
        </div>
      )}

      {/* Caso y contacto relacionados */}
      <div className="flex flex-wrap gap-1 text-xs text-gray-500">
        {caseName && (
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span className="truncate max-w-[100px]" title={caseName}>{caseName}</span>
          </div>
        )}
        {contactName && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="truncate max-w-[100px]" title={contactName}>{contactName}</span>
          </div>
        )}
      </div>

      {/* Metadatos inferiores */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {/* Usuarios asignados */}
          {assignedUsers.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{assignedUsers.length}</span>
            </div>
          )}

          {/* Subtareas */}
          {subtasks.length > 0 && (
            <div className="flex items-center gap-1">
              <CheckSquare className="h-3 w-3" />
              <span>{completedSubtasks}/{subtasks.length}</span>
            </div>
          )}

          {/* Comentarios */}
          {comments.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{comments.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
