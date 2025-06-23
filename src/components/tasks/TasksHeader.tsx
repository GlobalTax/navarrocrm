
import { Button } from '@/components/ui/button'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { TaskViewMode } from '@/pages/Tasks'

interface TasksHeaderProps {
  viewMode: TaskViewMode
  setViewMode: (mode: TaskViewMode) => void
  onCreateTask: () => void
}

export const TasksHeader = ({ viewMode, setViewMode, onCreateTask }: TasksHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'board' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('board')}
            className="flex items-center space-x-2"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Tablero</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex items-center space-x-2"
          >
            <List className="h-4 w-4" />
            <span>Lista</span>
          </Button>
        </div>

        <Button onClick={onCreateTask} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nueva Tarea</span>
        </Button>
      </div>
    </div>
  )
}
