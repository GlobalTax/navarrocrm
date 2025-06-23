
import { Button } from '@/components/ui/button'
import { LayoutGrid, List } from 'lucide-react'
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
        className="flex items-center space-x-2"
      >
        <LayoutGrid className="h-4 w-4" />
        <span>Tablero</span>
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="flex items-center space-x-2"
      >
        <List className="h-4 w-4" />
        <span>Lista</span>
      </Button>
    </div>
  )
}
