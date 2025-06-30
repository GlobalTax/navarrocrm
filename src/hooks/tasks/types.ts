
import { Database } from '@/integrations/supabase/types'

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']
export type TaskAssignment = Database['public']['Tables']['task_assignments']['Row']
export type TaskComment = Database['public']['Tables']['task_comments']['Row']

// Tipos para subtareas
export type TaskSubtask = Database['public']['Tables']['task_subtasks']['Row']
export type TaskSubtaskInsert = Database['public']['Tables']['task_subtasks']['Insert']
export type TaskSubtaskUpdate = Database['public']['Tables']['task_subtasks']['Update']

// Tipo extendido de tarea con relaciones
export type TaskWithRelations = Task & {
  task_assignments?: (TaskAssignment & {
    user?: { email: string; role: string }
  })[]
  case?: { title: string }
  contact?: { name: string }
  created_by_user?: { email: string }
  subtasks?: TaskSubtask[]
  comments?: TaskComment[]
}

export interface TaskStats {
  total_tasks: number
  pending_tasks: number
  in_progress_tasks: number
  completed_tasks: number
  overdue_tasks: number
  high_priority_tasks: number
}

// Estados válidos exactamente como están en la DB
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

// Mapeo para UI - solo para mostrar, no para datos
export const STATUS_LABELS: Record<TaskStatus, string> = {
  'pending': 'Pendiente',
  'in_progress': 'En Progreso',
  'completed': 'Completada',
  'cancelled': 'Cancelada'
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  'low': 'Baja',
  'medium': 'Media',
  'high': 'Alta',
  'urgent': 'Urgente'
}

// Colores consistentes para UI
export const STATUS_COLORS: Record<TaskStatus, string> = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'in_progress': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-gray-100 text-gray-800'
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  'low': 'text-green-600',
  'medium': 'text-yellow-600',
  'high': 'text-orange-600',
  'urgent': 'text-red-600'
}

// Tipos para drag & drop
export interface DraggedTask {
  id: string
  status: TaskStatus
  index: number
}

export interface DropResult {
  draggableId: string
  type: string
  source: {
    droppableId: string
    index: number
  }
  destination?: {
    droppableId: string
    index: number
  } | null
}
