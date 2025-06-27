
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { TaskInsert } from './types'

// Interfaz temporal hasta que se actualicen los tipos de Supabase
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

  // Por ahora, retornamos datos simulados hasta que los tipos se actualicen
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['bulk-task-operations'],
    queryFn: async (): Promise<BulkTaskOperation[]> => {
      // Las tablas no existen aún, devolvemos array vacío
      console.log('Bulk operations table not available yet, returning empty array')
      return []
    }
  })

  const createBulkTasks = useMutation({
    mutationFn: async (bulkData: BulkTaskCreateData) => {
      const user = await supabase.auth.getUser()
      if (!user.data.user?.user_metadata?.org_id) {
        throw new Error('No organization ID found')
      }

      const orgId = user.data.user.user_metadata.org_id
      const userId = user.data.user.id

      let processed = 0
      let failed = 0
      const errors: any[] = []

      // Note: Operations tracking table doesn't exist yet, so we skip this part
      console.log('Starting bulk task creation:', bulkData.tasks.length, 'tasks')

      // Procesar tareas en lotes
      const batchSize = 10
      for (let i = 0; i < bulkData.tasks.length; i += batchSize) {
        const batch = bulkData.tasks.slice(i, i + batchSize)
        
        try {
          const tasksWithOrgId = batch.map(task => ({
            ...task,
            org_id: orgId,
            created_by: userId,
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
      }

      return { processed, failed, errors }
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
