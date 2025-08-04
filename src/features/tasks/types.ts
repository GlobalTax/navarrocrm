/**
 * Types para el módulo de Tasks
 */

// Re-export de tipos existentes
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
  TaskSubtask,
  STATUS_LABELS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
  DraggedTask,
  DropResult
} from '@/hooks/tasks/types'

export type { TaskViewMode } from '@/hooks/tasks/useTasksPageState'