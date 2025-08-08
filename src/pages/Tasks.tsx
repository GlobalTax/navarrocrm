
import { useEffect } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { useTasksPageState } from '@/hooks/tasks/useTasksPageState'
import { useTasksFilters } from '@/hooks/tasks/useTasksFilters'
import { TasksStats } from '@/components/tasks/TasksStats'
import { TasksBoardKanban } from '@/components/tasks/TasksBoardKanban'
import { TasksList } from '@/components/tasks/TasksList'
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog'
import { TasksEmptyState } from '@/components/tasks/TasksEmptyState'
import { TasksErrorState } from '@/components/tasks/TasksErrorState'
import { TasksLoadingState } from '@/components/tasks/TasksLoadingState'
import { TasksViewSelector } from '@/components/tasks/TasksViewSelector'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { StandardFilters } from '@/components/layout/StandardFilters'

const Tasks = () => {
  const { tasks, taskStats, isLoading, error } = useTasks()
  const pageState = useTasksPageState()
  const filtersState = useTasksFilters()

  useEffect(() => {
    document.title = 'Tareas | Gestión de tareas';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Gestión de tareas del despacho: tablero, lista, filtros y prioridades.');
    }
  }, [])


  const filteredTasks = filtersState.filterTasks(tasks)

  if (error) {
    console.error('❌ Tasks page error:', error)
    return (
      <TasksErrorState 
        error={error} 
        onRetry={() => window.location.reload()} 
      />
    )
  }

  if (isLoading) {
    return <TasksLoadingState />
  }

  const safeTasks = Array.isArray(tasks) ? tasks : []

  return (
    <div className="space-y-6">
      <StandardPageHeader
        title="Tareas"
        description="Organiza y gestiona todas las tareas del despacho"
        primaryAction={{
          label: 'Nueva Tarea',
          onClick: pageState.handleCreateTask
        }}
      >
        <TasksViewSelector 
          viewMode={pageState.viewMode} 
          onViewModeChange={pageState.setViewMode} 
        />
      </StandardPageHeader>
      
      <TasksStats stats={taskStats} />
      
      <div className="border-0.5 border-black rounded-[10px] shadow-sm p-3 animate-fade-in">
        <StandardFilters
          searchPlaceholder="Buscar tareas..."
          searchValue={filtersState.filters.search}
          onSearchChange={(value) => filtersState.setFilters({ ...filtersState.filters, search: value })}
          filters={[
            {
              placeholder: 'Estado',
              value: filtersState.filters.status,
              onChange: (value) => filtersState.setFilters({ ...filtersState.filters, status: value }),
              options: filtersState.statusOptions
            },
            {
              placeholder: 'Prioridad',
              value: filtersState.filters.priority,
              onChange: (value) => filtersState.setFilters({ ...filtersState.filters, priority: value }),
              options: filtersState.priorityOptions
            }
          ]}
          hasActiveFilters={filtersState.hasActiveFilters}
          onClearFilters={filtersState.handleClearFilters}
        />
      </div>

      {safeTasks.length === 0 ? (
        <TasksEmptyState onCreateTask={pageState.handleCreateTask} />
      ) : (
        <>
          {pageState.viewMode === 'board' ? (
            <TasksBoardKanban 
              tasks={filteredTasks}
              onEditTask={pageState.handleEditTask}
              onCreateTask={pageState.handleCreateTask}
            />
          ) : (
            <TasksList 
              tasks={filteredTasks}
              onEditTask={pageState.handleEditTask}
            />
          )}
        </>
      )}

      <TaskFormDialog
        isOpen={pageState.isTaskDialogOpen}
        onClose={pageState.closeTaskDialog}
        task={pageState.selectedTask}
      />
    </div>
  )
}

export default Tasks
