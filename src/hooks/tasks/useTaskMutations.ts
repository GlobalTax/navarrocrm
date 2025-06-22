
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { TaskInsert, TaskUpdate, TaskSubtaskInsert, TaskSubtaskUpdate } from './types'

export const useTaskMutations = () => {
  const queryClient = useQueryClient()

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

  // Nuevas mutaciones para subtareas
  const createSubtaskMutation = useMutation({
    mutationFn: async (subtaskData: TaskSubtaskInsert) => {
      const { data, error } = await supabase
        .from('task_subtasks')
        .insert(subtaskData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Subtarea creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating subtask:', error)
      toast.error('Error al crear la subtarea')
    },
  })

  const updateSubtaskMutation = useMutation({
    mutationFn: async ({ id, ...updates }: TaskSubtaskUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('task_subtasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Subtarea actualizada exitosamente')
    },
    onError: (error) => {
      console.error('Error updating subtask:', error)
      toast.error('Error al actualizar la subtarea')
    },
  })

  const deleteSubtaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('task_subtasks')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Subtarea eliminada exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting subtask:', error)
      toast.error('Error al eliminar la subtarea')
    },
  })

  return {
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    assignTask: assignTaskMutation.mutate,
    createSubtask: createSubtaskMutation.mutate,
    updateSubtask: updateSubtaskMutation.mutate,
    deleteSubtask: deleteSubtaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  }
}
