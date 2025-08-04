/**
 * Tasks Components Module
 */

// Re-export de componentes principales
export { TaskFormDialog } from '@/components/tasks/TaskFormDialog'
export { TasksList } from '@/components/tasks/TasksList'
export { TasksBoard } from '@/components/tasks/TasksBoard'
export { TasksBoardKanban } from '@/components/tasks/TasksBoardKanban'
export { TaskCard } from '@/components/tasks/TaskCard'
export { TasksStats } from '@/components/tasks/TasksStats'
export { TasksEmptyState } from '@/components/tasks/TasksEmptyState'
export { TasksErrorState } from '@/components/tasks/TasksErrorState'
export { TasksLoadingState } from '@/components/tasks/TasksLoadingState'
export { TasksViewSelector } from '@/components/tasks/TasksViewSelector'

// Re-export de componentes especializados
export { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer'
export { BulkTaskAssignmentModal } from '@/components/tasks/BulkTaskAssignmentModal'

// Re-export de componentes de formulario
export { TaskBasicFields } from '@/components/tasks/form/TaskBasicFields'
export { TaskDateFields } from '@/components/tasks/form/TaskDateFields'
export { TaskAssignmentFields } from '@/components/tasks/form/TaskAssignmentFields'
export { TaskUserAssignmentFields } from '@/components/tasks/form/TaskUserAssignmentFields'

// Re-export de componentes de card
export { TaskCardHeader } from '@/components/tasks/card/TaskCardHeader'
export { TaskCardBadges } from '@/components/tasks/card/TaskCardBadges'
export { TaskCardMetadata } from '@/components/tasks/card/TaskCardMetadata'