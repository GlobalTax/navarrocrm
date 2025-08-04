/**
 * Tasks Feature Module
 * Punto de entrada centralizado para toda la funcionalidad de tareas
 */

// Re-exports de componentes principales
export { TaskFormDialog } from './components'
export { TasksList } from './components'
export { TasksBoard } from './components'
export { TasksBoardKanban } from './components'
export { TaskCard } from './components'
export { TasksStats } from './components'
export { TasksEmptyState } from './components'
export { TasksErrorState } from './components'
export { TasksLoadingState } from './components'
export { TasksViewSelector } from './components'

// Re-exports de hooks
export { useTasks } from './hooks'
export { useTasksFilters } from './hooks'
export { useTasksPageState } from './hooks'
export { useTaskForm } from './hooks'
export { useBulkTaskAssignment } from './hooks'

// Re-exports de tipos
export type {
  Task,
  TaskWithRelations,
  TaskStatus,
  TaskPriority,
  TaskStats,
  TaskInsert,
  TaskUpdate,
  TaskAssignment,
  TaskComment,
  TaskSubtask
} from './types'