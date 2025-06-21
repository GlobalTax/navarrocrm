
import { Button } from '@/components/ui/button'
import { Plus, LayoutGrid, List, Scale, Gavel } from 'lucide-react'
import { TaskViewMode } from '@/pages/Tasks'

interface TasksHeaderProps {
  viewMode: TaskViewMode
  setViewMode: (mode: TaskViewMode) => void
  onCreateTask: () => void
}

export const TasksHeader = ({ viewMode, setViewMode, onCreateTask }: TasksHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Scale className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Tareas Legales</h1>
            <p className="text-sm text-gray-600">Seguimiento de gestiones procesales y administrativas</p>
          </div>
        </div>
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
            <span>Kanban Legal</span>
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
          <span>Nueva Gestión</span>
        </Button>
      </div>
    </div>
  )
}
