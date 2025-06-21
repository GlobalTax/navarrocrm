
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Database } from '@/integrations/supabase/types'
import { toast } from 'sonner'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']
type TaskAssignment = Database['public']['Tables']['task_assignments']['Row']
type TaskComment = Database['public']['Tables']['task_comments']['Row']

export const useTasks = () => {
  const queryClient = useQueryClient()

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_assignments:task_assignments(
            *,
            user:users(email, role)
          ),
          case:cases(title),
          client:clients(name),
          created_by_user:users!tasks_created_by_fkey(email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
  })

  const { data: taskStats } = useQuery({
    queryKey: ['task-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_task_stats', {
        org_uuid: (await supabase.auth.getUser()).data.user?.user_metadata?.org_id
      })

      if (error) throw error
      return data?.[0] || {
        total_tasks: 0,
        pending_tasks: 0,
        in_progress_tasks: 0,
        completed_tasks: 0,
        overdue_tasks: 0,
        high_priority_tasks: 0
      }
    },
  })

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: TaskInsert) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-stats'] })
      toast.success('Tarea creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating task:', error)
      toast.error('Error al crear la tarea')
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...updates }: TaskUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-stats'] })
      toast.success('Tarea actualizada exitosamente')
    },
    onError: (error) => {
      console.error('Error updating task:', error)
      toast.error('Error al actualizar la tarea')
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-stats'] })
      toast.success('Tarea eliminada exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting task:', error)
      toast.error('Error al eliminar la tarea')
    },
  })

  const assignTaskMutation = useMutation({
    mutationFn: async ({ taskId, userId, assignedBy }: { taskId: string, userId: string, assignedBy: string }) => {
      const { data, error } = await supabase
        .from('task_assignments')
        .insert({
          task_id: taskId,
          user_id: userId,
          assigned_by: assignedBy
        })
        .select()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Tarea asignada exitosamente')
    },
    onError: (error) => {
      console.error('Error assigning task:', error)
      toast.error('Error al asignar la tarea')
    },
  })

  return {
    tasks,
    taskStats,
    isLoading,
    error,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    assignTask: assignTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  }
}
