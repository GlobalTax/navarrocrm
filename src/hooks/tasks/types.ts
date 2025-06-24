
import { Database } from '@/integrations/supabase/types'

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']
export type TaskAssignment = Database['public']['Tables']['task_assignments']['Row']
export type TaskComment = Database['public']['Tables']['task_comments']['Row']

// Nuevos tipos para subtareas
export type TaskSubtask = {
  id: string
  task_id: string
  title: string
  completed: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type TaskSubtaskInsert = {
  task_id: string
  title: string
  completed?: boolean
  sort_order?: number
}

export type TaskSubtaskUpdate = {
  title?: string
  completed?: boolean
  sort_order?: number
}

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

// Mapeo de estados para compatibilidad
export const STATUS_MAPPING = {
  'pendiente': 'pending',
  'en_progreso': 'in_progress',
  'completada': 'completed',
  'cancelada': 'cancelled',
  'investigacion': 'investigation',
  'redaccion': 'drafting',
  'revision': 'review',
  'presentacion': 'filing',
  'audiencia': 'hearing'
} as const

export const PRIORITY_MAPPING = {
  'critica': 'critical',
  'urgente': 'urgent',
  'alta': 'high',
  'media': 'medium',
  'baja': 'low'
} as const

// Tipos para el sistema de drag & drop
export interface DraggedTask {
  id: string
  status: string
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
