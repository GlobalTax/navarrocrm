
import { Card, CardContent } from '@/components/ui/card'
import { TaskCardHeader } from './card/TaskCardHeader'
import { TaskCardBadges } from './card/TaskCardBadges'
import { TaskCardMetadata } from './card/TaskCardMetadata'
import { TaskWithRelations, TaskStatus, TaskPriority } from '@/hooks/tasks/types'

interface TaskCardProps {
  task: TaskWithRelations
  onEdit: () => void
  onStatusChange?: (newStatus: string) => void
  showStatusSelector?: boolean
}

export const TaskCard = ({ task, onEdit, onStatusChange, showStatusSelector = false }: TaskCardProps) => {
  // Validación robusta de datos
  if (!task || !task.id) {
    console.warn('⚠️ TaskCard received invalid task:', task)
    return (
      <Card className="p-4 border-red-200 bg-red-50">
        <p className="text-red-600 text-sm">Error: Datos de tarea inválidos</p>
      </Card>
    )
  }

  // Manejo seguro de datos relacionados con valores por defecto
  const assignedUsers = Array.isArray(task.task_assignments) ? task.task_assignments : []
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : []
  const comments = Array.isArray(task.comments) ? task.comments : []

  // Función para validar y limpiar prioridad
  const validatePriority = (priority: any): TaskPriority => {
    const validPriorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent']
    if (typeof priority === 'string' && validPriorities.includes(priority as TaskPriority)) {
      return priority as TaskPriority
    }
    return 'medium'
  }

  // Función para validar y limpiar estado
  const validateStatus = (status: any): TaskStatus => {
    const validStatuses: TaskStatus[] = ['pending', 'in_progress', 'completed', 'cancelled']
    if (typeof status === 'string' && validStatuses.includes(status as TaskStatus)) {
      return status as TaskStatus
    }
    return 'pending'
  }

  // Validación de campos críticos con limpieza de datos
  const safeTask = {
    ...task,
    title: typeof task.title === 'string' ? task.title : 'Sin título',
    description: typeof task.description === 'string' ? task.description : '',
    priority: validatePriority(task.priority),
    status: validateStatus(task.status),
    due_date: task.due_date || null,
    case: task.case || null,
    contact: task.contact || null
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group border-0.5 border-black rounded-[10px]">
      <CardContent className="p-4">
        <TaskCardHeader 
          title={safeTask.title}
          onEdit={onEdit}
        />

        {safeTask.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {safeTask.description}
          </p>
        )}

        <TaskCardBadges 
          priority={safeTask.priority}
          status={safeTask.status}
        />

        <TaskCardMetadata
          dueDate={safeTask.due_date}
          taskStatus={safeTask.status}
          assignedUsers={assignedUsers}
          subtasks={subtasks}
          comments={comments}
          caseName={safeTask.case?.title}
          contactName={safeTask.contact?.name}
        />
      </CardContent>
    </Card>
  )
}
