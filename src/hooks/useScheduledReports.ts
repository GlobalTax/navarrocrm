
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface ScheduledReportConfig {
  id?: string
  org_id: string
  user_id: string
  report_name: string
  report_type: 'dashboard' | 'time_tracking' | 'financial' | 'cases'
  frequency: 'daily' | 'weekly' | 'monthly'
  email_recipients: string[]
  metrics_included: string[]
  is_enabled: boolean
  next_send_date: string
  created_at?: string
  updated_at?: string
}

export const useScheduledReports = () => {
  return useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_reports' as any)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    }
  })
}

export const useCreateScheduledReport = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (config: Omit<ScheduledReportConfig, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('scheduled_reports' as any)
        .insert(config)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] })
      toast.success('Reporte programado creado exitosamente')
    },
    onError: (error: any) => {
      console.error('Error creando reporte:', error)
      toast.error('Error al crear el reporte programado')
    }
  })
}

export const useUpdateScheduledReport = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...config }: ScheduledReportConfig) => {
      const { data, error } = await supabase
        .from('scheduled_reports' as any)
        .update(config)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] })
      toast.success('Reporte actualizado exitosamente')
    },
    onError: (error: any) => {
      console.error('Error actualizando reporte:', error)
      toast.error('Error al actualizar el reporte')
    }
  })
}

export const useDeleteScheduledReport = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scheduled_reports' as any)
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] })
      toast.success('Reporte eliminado exitosamente')
    },
    onError: (error: any) => {
      console.error('Error eliminando reporte:', error)
      toast.error('Error al eliminar el reporte')
    }
  })
}
