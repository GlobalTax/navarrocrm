
import { useState } from 'react'
import { TasksHeader } from '@/components/tasks/TasksHeader'
import { TasksStats } from '@/components/tasks/TasksStats'
import { TasksFilters } from '@/components/tasks/TasksFilters'
import { TasksBoardKanban } from '@/components/tasks/TasksBoardKanban'
import { TasksList } from '@/components/tasks/TasksList'
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'

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

  // Mostrar estado vacío si no hay tareas
  if (safeTasks.length === 0) {
    return (
      <div className="space-y-6">
        <TasksHeader 
          viewMode={viewMode}
          setViewMode={setViewMode}
          onCreateTask={handleCreateTask}
        />
        
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <TasksHeader 
        viewMode={viewMode}
        setViewMode={setViewMode}
        onCreateTask={handleCreateTask}
      />
      
      <TasksStats stats={taskStats} />
      
      <TasksFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

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

      <TaskFormDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        task={selectedTask}
      />
    </div>
  )
}

export default Tasks
