
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, CheckSquare, MessageSquare, Users } from 'lucide-react'
import { format, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'

interface TaskCardMetadataProps {
  dueDate: string | null
  taskStatus: string
  assignedUsers: any[]
  subtasks?: any[]
  comments?: any[]
}

export const TaskCardMetadata = ({ 
  dueDate, 
  taskStatus, 
  assignedUsers, 
  subtasks = [], 
  comments = [] 
}: TaskCardMetadataProps) => {
  const formatSmartDate = (dateString: string | null) => {
    if (!dateString) return { text: 'Sin fecha', color: 'text-gray-400' }
    
    const date = new Date(dateString)
    const now = new Date()
    const isOverdue = date < now && taskStatus !== 'completed'
    
    if (isToday(date)) return { text: 'Hoy', color: isOverdue ? 'text-red-600' : 'text-blue-600' }
    if (isTomorrow(date)) return { text: 'Mañana', color: 'text-green-600' }
    
    return { 
      text: format(date, 'dd/MM', { locale: es }), 
      color: isOverdue ? 'text-red-600' : 'text-gray-600' 
    }
  }

  const getUserInitials = (email: string) => {
    if (!email) return '?'
    const parts = email.split('@')[0].split('.')
    return parts.map(part => part[0]?.toUpperCase()).join('').slice(0, 2)
  }

  const smartDate = formatSmartDate(dueDate)
  const subtasksCount = subtasks?.length || 0
  const completedSubtasks = subtasks?.filter((st: any) => st.completed).length || 0
  const commentsCount = comments?.length || 0

  return (
    <>
      {/* Fecha de vencimiento */}
      {dueDate && (
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

      {/* Contadores */}
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
    </>
  )
}
