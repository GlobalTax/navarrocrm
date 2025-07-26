/**
 * Tipos para el módulo de tareas
 */

import { BaseEntity, User } from '../core'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task extends BaseEntity {
  title: string
  description?: string
  case_id?: string
  assigned_user_id?: string
  created_by_user_id: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
  estimated_hours?: number
  actual_hours?: number
  tags?: string[]
  dependencies?: string[]
  completed_at?: string
  assigned_user?: User
  created_by_user?: User
}

export interface TaskFilters {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  assigned_user_id?: string
  case_id?: string
  tags?: string[]
  due_date_range?: {
    start: string
    end: string
  }
  search?: string
}

export interface CreateTaskData {
  title: string
  description?: string
  case_id?: string
  assigned_user_id?: string
  priority: TaskPriority
  due_date?: string
  estimated_hours?: number
  tags?: string[]
  dependencies?: string[]
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: TaskStatus
  actual_hours?: number
  completed_at?: string
}

export interface TaskMetrics {
  total: number
  by_status: Record<TaskStatus, number>
  by_priority: Record<TaskPriority, number>
  overdue: number
  completion_rate: number
  average_completion_time: number
}