
import { useState } from 'react'
import { TasksStats } from '@/components/tasks/TasksStats'
import { TasksBoardKanban } from '@/components/tasks/TasksBoardKanban'
import { TasksList } from '@/components/tasks/TasksList'
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog'
import { Button } from '@/components/ui/button'
import { Plus, CheckSquare, LayoutGrid, List } from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { StandardFilters } from '@/components/layout/StandardFilters'

export type TaskViewMode = 'board' | 'list'

const Tasks = () => {
  const [viewMode, setViewMode] = useState<TaskViewMode>('board')
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    search: ''
  })

  const { tasks, taskStats, isLoading, error } = useTasks()

  console.log('🔍 Tasks page state:', { 
    tasks: tasks?.length, 
    taskStats, 
    isLoading, 
    error: error?.message 
  })

  const safeTasks = Array.isArray(tasks) ? tasks : []
  
  const filteredTasks = safeTasks.filter(task => {
    if (!task || !task.id) {
      console.warn('⚠️ Filtering out invalid task:', task)
      return false
    }

    if (filters.status !== 'all' && task.status !== filters.status) return false
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false
    if (filters.search && !task.title?.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const handleCreateTask = () => {
    setSelectedTask(null)
    setIsTaskDialogOpen(true)
  }

  const handleEditTask = (task: any) => {
    if (!task || !task.id) {
      console.warn('⚠️ Attempted to edit invalid task:', task)
      return
    }
    console.log('🔍 Editing task:', task)
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      assignee: 'all',
      search: ''
    })
  }

  if (error) {
    console.error('❌ Tasks page error:', error)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error al cargar las tareas</div>
          <div className="text-gray-500 text-sm">{error.message}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Recargar página
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando tareas...</div>
      </div>
    )
  }

  const statusOptions = [
    { label: 'Todos los estados', value: 'all' },
    { label: 'Pendiente', value: 'pending' },
    { label: 'En progreso', value: 'in_progress' },
    { label: 'Completada', value: 'completed' }
  ]

  const priorityOptions = [
    { label: 'Todas las prioridades', value: 'all' },
    { label: 'Baja', value: 'low' },
    { label: 'Media', value: 'medium' },
    { label: 'Alta', value: 'high' },
    { label: 'Urgente', value: 'urgent' }
  ]

  const hasActiveFilters = filters.status !== 'all' || filters.priority !== 'all' || filters.assignee !== 'all' || filters.search

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Tareas"
        description="Organiza y gestiona todas las tareas del despacho"
        icon={CheckSquare}
        primaryAction={{
          label: 'Nueva Tarea',
          onClick: handleCreateTask
        }}
      >
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
      </StandardPageHeader>
      
      <TasksStats stats={taskStats} />
      
      <StandardFilters
        searchPlaceholder="Buscar tareas..."
        searchValue={filters.search}
        onSearchChange={(value) => setFilters({ ...filters, search: value })}
        filters={[
          {
            placeholder: 'Estado',
            value: filters.status,
            onChange: (value) => setFilters({ ...filters, status: value }),
            options: statusOptions
          },
          {
            placeholder: 'Prioridad',
            value: filters.priority,
            onChange: (value) => setFilters({ ...filters, priority: value }),
            options: priorityOptions
          }
        ]}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {safeTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay tareas
            </h3>
            <p className="text-gray-500 mb-6">
              Comienza creando tu primera tarea para organizar tu trabajo.
            </p>
            <Button onClick={handleCreateTask} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Crear primera tarea
            </Button>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'board' ? (
            <TasksBoardKanban 
              tasks={filteredTasks}
              onEditTask={handleEditTask}
              onCreateTask={handleCreateTask}
            />
          ) : (
            <TasksList 
              tasks={filteredTasks}
              onEditTask={handleEditTask}
            />
          )}
        </>
      )}

      <TaskFormDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        task={selectedTask}
      />
    </StandardPageContainer>
  )
}

export default Tasks
