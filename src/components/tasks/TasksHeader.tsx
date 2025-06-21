
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
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Tareas</h1>
        <p className="text-gray-600">Organiza y gestiona todas las tareas del equipo</p>
      </div>

      <div className="flex items-center gap-3">
        {/* View mode toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'board' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('board')}
            className="h-8"
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Tablero
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8"
          >
            <List className="h-4 w-4 mr-1" />
            Lista
          </Button>
        </div>

        <Button onClick={onCreateTask} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>
    </div>
  )
}
