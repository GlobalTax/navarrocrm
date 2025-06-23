
import { CheckSquare } from 'lucide-react'
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
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { StandardFilters } from '@/components/layout/StandardFilters'

const Tasks = () => {
  const { tasks, taskStats, isLoading, error } = useTasks()
  const pageState = useTasksPageState()
  const filtersState = useTasksFilters()

  console.log('🔍 Tasks page state:', { 
    tasks: tasks?.length, 
    taskStats, 
    isLoading, 
    error: error?.message 
  })

  const filteredTasks = filtersState.filterTasks(tasks)

  if (error) {
    console.error('❌ Tasks page error:', error)
    return <TasksErrorState error={error} />
  }

  if (isLoading) {
    return <TasksLoadingState />
  }

  const safeTasks = Array.isArray(tasks) ? tasks : []

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Tareas"
        description="Organiza y gestiona todas las tareas del despacho"
        icon={CheckSquare}
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
    </StandardPageContainer>
  )
}

export default Tasks
