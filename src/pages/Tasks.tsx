
import { useState } from 'react'
import { TasksHeader } from '@/components/tasks/TasksHeader'
import { TasksStats } from '@/components/tasks/TasksStats'
import { TasksFil

ters } from '@/components/tasks/TasksFilters'
import { TasksBoard } from '@/components/tasks/TasksBoard'
import { TasksList } from '@/components/tasks/TasksList'
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog'
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

  console.log('🔍 Legal Tasks page state:', { 
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

    // Mapear filtros a estados legales
    const statusMapping: { [key: string]: string[] } = {
      'all': ['pending', 'investigation', 'drafting', 'review', 'filing', 'hearing', 'completed', 'in_progress'],
      'pending': ['pending'],
      'investigation': ['investigation', 'in_progress'],
      'drafting': ['drafting'],
      'review': ['review'],
      'filing': ['filing'],
      'hearing': ['hearing'],
      'completed': ['completed']
    }

    const allowedStatuses = statusMapping[filters.status] || [filters.status]
    if (filters.status !== 'all' && !allowedStatuses.includes(task.status)) return false
    
    // Filtro de prioridad mejorado para términos legales
    if (filters.priority !== 'all') {
      if (filters.priority === 'critical' && task.priority !== 'critical') return false
      if (filters.priority === 'urgent' && !['urgent', 'critical'].includes(task.priority)) return false
      if (filters.priority === 'high' && task.priority !== 'high') return false
      if (filters.priority === 'medium' && task.priority !== 'medium') return false
      if (filters.priority === 'low' && task.priority !== 'low') return false
    }
    
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
    console.log('🔍 Editing legal task:', task)
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  if (error) {
    console.error('❌ Legal Tasks page error:', error)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error al cargar las gestiones legales</div>
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
        <div className="text-gray-500">Cargando gestiones legales...</div>
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
        <TasksBoard 
          tasks={filteredTasks}
          onEditTask={handleEditTask}
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
