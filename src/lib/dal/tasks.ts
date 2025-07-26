import { BaseDAL } from './base'
import { QueryOptions } from './types'

export interface Task {
  id: string
  title: string
  description?: string
  case_id?: string
  client_id?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  estimated_hours?: number
  actual_hours?: number
  due_date?: string
  completed_at?: string
  created_by: string
  assigned_to?: string
  org_id: string
  created_at: string
  updated_at: string
}

export interface CreateTaskData {
  title: string
  description?: string
  case_id?: string
  client_id?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  estimated_hours?: number
  due_date?: string
  assigned_to?: string
}

class TasksDAL extends BaseDAL<Task> {
  constructor() {
    super('tasks')
  }

  async createTask(data: CreateTaskData, orgId: string, createdBy: string) {
    const taskData = {
      ...data,
      org_id: orgId,
      created_by: createdBy,
      status: 'pending' as const
    }
    
    return this.create(taskData)
  }

  async getTasksByCase(caseId: string, options?: QueryOptions) {
    return this.findMany({
      ...options,
      filters: {
        ...options?.filters,
        case_id: caseId
      }
    })
  }

  async getTasksByUser(userId: string, options?: QueryOptions) {
    return this.findMany({
      ...options,
      filters: {
        ...options?.filters,
        assigned_to: userId
      }
    })
  }

  async updateTaskStatus(id: string, status: Task['status']) {
    const updateData: Partial<Task> = { status }
    
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }
    
    return this.update(id, updateData)
  }
}

export const tasksDAL = new TasksDAL()