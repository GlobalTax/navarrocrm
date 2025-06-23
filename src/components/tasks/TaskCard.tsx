
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
  if (!task || !task.id) return null

  // Contadores para elementos relacionados
  const assignedUsers = task.task_assignments || []

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-4">
        <TaskCardHeader 
          title={task.title}
          onEdit={onEdit}
        />

        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <TaskCardBadges 
          priority={task.priority}
          status={task.status}
        />

        <TaskCardMetadata
          dueDate={task.due_date}
          taskStatus={task.status}
          assignedUsers={assignedUsers}
          subtasks={task.subtasks}
          comments={task.comments}
        />
      </CardContent>
    </Card>
  )
}
