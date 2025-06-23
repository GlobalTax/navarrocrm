
import { Button } from '@/components/ui/button'
import { TaskViewMode } from '@/hooks/tasks/useTasksPageState'

interface TasksViewSelectorProps {
  viewMode: TaskViewMode
  onViewModeChange: (mode: TaskViewMode) => void
}

export const TasksViewSelector = ({ viewMode, onViewModeChange }: TasksViewSelectorProps) => {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <Button
        variant={viewMode === 'board' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('board')}
      >
        Tablero
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
      >
        Lista
      </Button>
    </div>
  )
}
