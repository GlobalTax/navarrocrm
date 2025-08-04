
import { 
  useTasks, 
  useTasksPageState, 
  useTasksFilters,
  TasksStats,
  TasksBoardKanban,
  TasksList,
  TaskFormDialog,
  TasksEmptyState,
  TasksErrorState,
  TasksLoadingState,
  TasksViewSelector
} from '@/features/tasks'
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
    </div>
  )
}

export default Tasks
