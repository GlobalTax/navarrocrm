/**
 * Tasks Feature Module
 * 
 * Gestión de tareas y seguimiento de trabajo
 */

// Components (pages)
export { default as TasksPage } from './pages/TasksPage'

// Components
export { TasksList, TaskFilters, BulkTaskAssignmentModal } from './components'

// Hooks
export { useTasksList, useTasksQueries, useTasksActions } from './hooks'

// Types (placeholder)
// export type { Task } from '@/types/task'