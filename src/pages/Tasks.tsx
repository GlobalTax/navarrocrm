
import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { TasksHeader } from '@/components/tasks/TasksHeader'
import { TasksStats } from '@/components/tasks/TasksStats'
import { TasksFilters } from '@/components/tasks/TasksFilters'
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
    status: '',
    priority: '',
    assignee: '',
    search: ''
  })

  const { tasks, taskStats, isLoading, error } = useTasks()

  console.log('🔍 Tasks page state:', { tasks: tasks?.length, taskStats, isLoading, error })

  const filteredTasks = tasks?.filter(task => {
    if (filters.status && task.status !== filters.status) return false
    if (filters.priority && task.priority !== filters.priority) return false
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  }) || []

  const handleCreateTask = () => {
    setSelectedTask(null)
    setIsTaskDialogOpen(true)
  }

  const handleEditTask = (task: any) => {
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">Error al cargar las tareas</div>
            <div className="text-gray-500 text-sm">{error.message}</div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando tareas...</div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
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
    </MainLayout>
  )
}

export default Tasks
