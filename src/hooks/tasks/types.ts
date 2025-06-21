
import { Database } from '@/integrations/supabase/types'

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']
export type TaskAssignment = Database['public']['Tables']['task_assignments']['Row']
export type TaskComment = Database['public']['Tables']['task_comments']['Row']

export interface TaskStats {
  total_tasks: number
  pending_tasks: number
  in_progress_tasks: number
  completed_tasks: number
  overdue_tasks: number
  high_priority_tasks: number
}
