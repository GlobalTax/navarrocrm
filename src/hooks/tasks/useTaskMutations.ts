
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { TaskInsert, TaskUpdate, TaskSubtaskInsert, TaskSubtaskUpdate, TaskStatus, TaskPriority } from './types'

export const useTaskMutations = () => {
  const queryClient = useQueryClient()

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: TaskInsert) => {
      console.log('🔄 Creando tarea:', taskData)
      
      // Validar datos críticos
      if (!taskData.title?.trim()) {
        throw new Error('El título de la tarea es obligatorio')
      }
      
      if (!taskData.org_id) {
        throw new Error('ID de organización requerido')
      }

      // Asegurar que los enums sean válidos
      const validStatuses: TaskStatus[] = ['pending', 'in_progress', 'completed', 'cancelled']
      const validPriorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent']
      
      if (taskData.status && !validStatuses.includes(taskData.status as TaskStatus)) {
        taskData.status = 'pending'
      }
      
      if (taskData.priority && !validPriorities.includes(taskData.priority as TaskPriority)) {
        taskData.priority = 'medium'
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select(`
          *,
          task_assignments!task_assignments_task_id_fkey(
            *,
            user:users!task_assignments_user_id_fkey(email, role)
          ),
          case:cases!tasks_case_id_fkey(title),
          contact:contacts!tasks_contact_id_fkey(name),
          created_by_user:users!tasks_created_by_fkey(email)
        `)
        .maybeSingle()

      if (error) {
        console.error('❌ Error creando tarea:', error)
        throw new Error(`Error al crear la tarea: ${error.message}`)
      }
      
      console.log('✅ Tarea creada:', data)
      return data
    },
    onSuccess: (createdTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-stats'] })
      toast.success('Tarea creada exitosamente')
      return createdTask
    },
    onError: (error) => {
      console.error('❌ Error creating task:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear la tarea')
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...updates }: TaskUpdate & { id: string }) => {
      console.log('🔄 Actualizando tarea:', id, updates)
      
      if (!id) {
        throw new Error('ID de tarea requerido para actualización')
      }

      // Validar enums si están presentes
      const validStatuses: TaskStatus[] = ['pending', 'in_progress', 'completed', 'cancelled']
      const validPriorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent']
      
      if (updates.status && !validStatuses.includes(updates.status as TaskStatus)) {
        throw new Error(`Estado inválido: ${updates.status}`)
      }
      
      if (updates.priority && !validPriorities.includes(updates.priority as TaskPriority)) {
        throw new Error(`Prioridad inválida: ${updates.priority}`)
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          task_assignments!task_assignments_task_id_fkey(
            *,
            user:users!task_assignments_user_id_fkey(email, role)
          ),
          case:cases!tasks_case_id_fkey(title),
          contact:contacts!tasks_contact_id_fkey(name),
          created_by_user:users!tasks_created_by_fkey(email)
        `)
        .single()

      if (error) {
        console.error('❌ Error actualizando tarea:', error)
        throw new Error(`Error al actualizar la tarea: ${error.message}`)
      }
      
      console.log('✅ Tarea actualizada:', data)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-stats'] })
      toast.success('Tarea actualizada exitosamente')
    },
    onError: (error) => {
      console.error('❌ Error updating task:', error)
      toast.error(error instanceof Error ? error.message : 'Error al actualizar la tarea')
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('🔄 Eliminando tarea:', id)
      
      if (!id) {
        throw new Error('ID de tarea requerido para eliminación')
      }
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Error eliminando tarea:', error)
        throw new Error(`Error al eliminar la tarea: ${error.message}`)
      }
      
      console.log('✅ Tarea eliminada:', id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-stats'] })
      toast.success('Tarea eliminada exitosamente')
    },
    onError: (error) => {
      console.error('❌ Error deleting task:', error)
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la tarea')
    },
  })

  const assignTaskMutation = useMutation({
    mutationFn: async ({ taskId, userId, assignedBy }: { taskId: string, userId: string, assignedBy: string }) => {
      console.log('🔄 Asignando tarea:', { taskId, userId, assignedBy })
      
      if (!taskId || !userId || !assignedBy) {
        throw new Error('IDs de tarea, usuario y asignador son requeridos')
      }
      
      const { data, error } = await supabase
        .from('task_assignments')
        .insert({
          task_id: taskId,
          user_id: userId,
          assigned_by: assignedBy
        })
        .select()

      if (error) {
        console.error('❌ Error asignando tarea:', error)
        throw new Error(`Error al asignar la tarea: ${error.message}`)
      }
      
      console.log('✅ Tarea asignada:', data)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Tarea asignada exitosamente')
    },
    onError: (error) => {
      console.error('❌ Error assigning task:', error)
      toast.error(error instanceof Error ? error.message : 'Error al asignar la tarea')
    },
  })

  // Mutaciones para subtareas con validación mejorada
  const createSubtaskMutation = useMutation({
    mutationFn: async (subtaskData: TaskSubtaskInsert) => {
      if (!subtaskData.title?.trim()) {
        throw new Error('El título de la subtarea es obligatorio')
      }
      
      if (!subtaskData.task_id) {
        throw new Error('ID de tarea padre requerido')
      }

      const { data, error } = await supabase
        .from('task_subtasks')
        .insert(subtaskData)
        .select()
        .single()

      if (error) {
        throw new Error(`Error al crear subtarea: ${error.message}`)
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Subtarea creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating subtask:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear la subtarea')
    },
  })

  const updateSubtaskMutation = useMutation({
    mutationFn: async ({ id, ...updates }: TaskSubtaskUpdate & { id: string }) => {
      if (!id) {
        throw new Error('ID de subtarea requerido')
      }

      const { data, error } = await supabase
        .from('task_subtasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(`Error al actualizar subtarea: ${error.message}`)
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Subtarea actualizada exitosamente')
    },
    onError: (error) => {
      console.error('Error updating subtask:', error)
      toast.error(error instanceof Error ? error.message : 'Error al actualizar la subtarea')
    },
  })

  const deleteSubtaskMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        throw new Error('ID de subtarea requerido')
      }

      const { error } = await supabase
        .from('task_subtasks')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(`Error al eliminar subtarea: ${error.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Subtarea eliminada exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting subtask:', error)
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la subtarea')
    },
  })

  return {
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutate,
    assignTask: assignTaskMutation.mutateAsync,
    createSubtask: createSubtaskMutation.mutate,
    updateSubtask: updateSubtaskMutation.mutate,
    deleteSubtask: deleteSubtaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  }
}
