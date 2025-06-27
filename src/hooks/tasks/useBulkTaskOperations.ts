
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { TaskInsert } from './types'

export interface BulkTaskOperation {
  id: string
  org_id: string
  operation_type: 'create' | 'assign' | 'update' | 'delete'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  total_tasks: number
  processed_tasks: number
  failed_tasks: number
  operation_data: any
  error_log: any
  created_by: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface BulkTaskCreateData {
  tasks: TaskInsert[]
  template_id?: string
  operation_name?: string
}

export const useBulkTaskOperations = () => {
  const queryClient = useQueryClient()

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['bulk-task-operations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_bulk_operations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      return data as BulkTaskOperation[]
    }
  })

  const createBulkTasks = useMutation({
    mutationFn: async (bulkData: BulkTaskCreateData) => {
      const user = await supabase.auth.getUser()
      if (!user.data.user?.user_metadata?.org_id) {
        throw new Error('No organization ID found')
      }

      // Crear registro de operación masiva
      const { data: operation, error: opError } = await supabase
        .from('task_bulk_operations')
        .insert({
          org_id: user.data.user.user_metadata.org_id,
          operation_type: 'create',
          status: 'processing',
          total_tasks: bulkData.tasks.length,
          operation_data: { 
            template_id: bulkData.template_id,
            operation_name: bulkData.operation_name || 'Creación masiva'
          },
          created_by: user.data.user.id
        })
        .select()
        .single()

      if (opError) throw opError

      let processed = 0
      let failed = 0
      const errors: any[] = []

      // Procesar tareas en lotes
      const batchSize = 10
      for (let i = 0; i < bulkData.tasks.length; i += batchSize) {
        const batch = bulkData.tasks.slice(i, i + batchSize)
        
        try {
          const tasksWithOrgId = batch.map(task => ({
            ...task,
            org_id: user.data.user.user_metadata.org_id,
            created_by: user.data.user.id,
            due_date: task.due_date || null
          }))

          const { data: createdTasks, error: taskError } = await supabase
            .from('tasks')
            .insert(tasksWithOrgId)
            .select()

          if (taskError) {
            failed += batch.length
            errors.push({ batch: i / batchSize, error: taskError.message })
          } else {
            processed += createdTasks?.length || 0
          }
        } catch (error: any) {
          failed += batch.length
          errors.push({ batch: i / batchSize, error: error.message })
        }

        // Actualizar progreso
        await supabase
          .from('task_bulk_operations')
          .update({
            processed_tasks: processed,
            failed_tasks: failed,
            error_log: { errors }
          })
          .eq('id', operation.id)
      }

      // Marcar como completado
      await supabase
        .from('task_bulk_operations')
        .update({
          status: failed > 0 ? 'failed' : 'completed',
          completed_at: new Date().toISOString(),
          processed_tasks: processed,
          failed_tasks: failed,
          error_log: { errors }
        })
        .eq('id', operation.id)

      return { operation, processed, failed, errors }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['bulk-task-operations'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
      if (result.failed === 0) {
        toast.success(`${result.processed} tareas creadas correctamente`)
      } else {
        toast.warning(`${result.processed} tareas creadas, ${result.failed} fallaron`)
      }
    },
    onError: (error: any) => {
      console.error('Error in bulk task creation:', error)
      toast.error('Error en la creación masiva de tareas')
    }
  })

  return {
    operations,
    isLoading,
    createBulkTasks
  }
}
