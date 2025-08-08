
import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS, PRIORITY_LABELS, TaskStatus, TaskPriority } from '@/hooks/tasks/types'

interface TaskCardBadgesProps {
  priority: TaskPriority
  status: TaskStatus
}

export const TaskCardBadges = ({ priority, status }: TaskCardBadgesProps) => {
  // Validación de datos con fallbacks seguros
  const safePriority = (priority in PRIORITY_LABELS) ? priority : 'medium'
  const safeStatus = (status in STATUS_LABELS) ? status : 'pending'

  return (
    <div className="flex items-center gap-2 mb-3">
      <Badge 
        variant="outline"
        className="border-0.5 border-black rounded-[10px] bg-white text-black"
      >
        {STATUS_LABELS[safeStatus]}
      </Badge>
      <div className="text-xs font-medium text-gray-600">
        ● {PRIORITY_LABELS[safePriority]}
      </div>
    </div>
  )
}
