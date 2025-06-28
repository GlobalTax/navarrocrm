
import { Card, CardContent } from '@/components/ui/card'
import { TaskCardHeader } from './card/TaskCardHeader'
import { TaskCardBadges } from './card/TaskCardBadges'
import { TaskCardMetadata } from './card/TaskCardMetadata'

interface TaskCardProps {
  task: any
  onEdit: () => void
  onStatusChange?: (newStatus: string) => void
  showStatusSelector?: boolean
}

export const TaskCard = ({ task, onEdit, onStatusChange, showStatusSelector = false }: TaskCardProps) => {
  if (!task || !task.id) {
    console.warn('⚠️ TaskCard received invalid task:', task)
    return null
  }

  // Contadores para elementos relacionados con manejo seguro de errores
  const assignedUsers = Array.isArray(task.task_assignments) ? task.task_assignments : []
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : []
  const comments = Array.isArray(task.comments) ? task.comments : []

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-4">
        <TaskCardHeader 
          title={task.title || 'Sin título'}
          onEdit={onEdit}
        />

        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <TaskCardBadges 
          priority={task.priority || 'medium'}
          status={task.status || 'pending'}
        />

        <TaskCardMetadata
          dueDate={task.due_date}
          taskStatus={task.status || 'pending'}
          assignedUsers={assignedUsers}
          subtasks={subtasks}
          comments={comments}
          caseName={task.case?.title}
          contactName={task.contact?.name}
        />
      </CardContent>
    </Card>
  )
}
