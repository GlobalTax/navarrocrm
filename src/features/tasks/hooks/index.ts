/**
 * Tasks Hooks Module
 */

// Re-export de hooks existentes
export { useTasks } from '@/hooks/useTasks'
export { useTasksFilters } from '@/hooks/tasks/useTasksFilters'
export { useTasksPageState } from '@/hooks/tasks/useTasksPageState'
export { useTaskForm } from '@/hooks/useTaskForm'
export { useBulkTaskAssignment } from '@/hooks/useBulkTaskAssignment'

// Re-export de hooks internos de tasks
export { useTaskQueries } from '@/hooks/tasks/useTaskQueries'
export { useTaskMutations } from '@/hooks/tasks/useTaskMutations'