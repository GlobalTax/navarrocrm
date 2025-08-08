
import { Button } from '@/components/ui/button'
import { TaskViewMode } from '@/hooks/tasks/useTasksPageState'

interface TasksViewSelectorProps {
  viewMode: TaskViewMode
  onViewModeChange: (mode: TaskViewMode) => void
}

export const TasksViewSelector = ({ viewMode, onViewModeChange }: TasksViewSelectorProps) => {
  return (
    <div className="flex items-center border-0.5 border-black rounded-[10px] p-1 shadow-sm animate-fade-in">
      <Button
        variant={viewMode === 'board' ? 'default' : 'ghost'}
        size="sm"
        className="rounded-[10px] hover-scale"
        onClick={() => onViewModeChange('board')}
      >
        Tablero
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        className="rounded-[10px] hover-scale"
        onClick={() => onViewModeChange('list')}
      >
        Lista
      </Button>
    </div>
  )
}
