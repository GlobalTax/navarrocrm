
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface AnalyticsMetric {
  id: string
  org_id: string
  metric_type: string
  metric_date: string
  metric_data: Record<string, any>
  created_at: string
  updated_at: string
}

export const useAnalyticsMetrics = (metricType?: string) => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const { data: metrics = [], isLoading, error } = useQuery({
    queryKey: ['analytics-metrics', user?.org_id, metricType],
    queryFn: async (): Promise<AnalyticsMetric[]> => {
      if (!user?.org_id) {
        console.log('📊 No org_id disponible para obtener métricas')
        return []
      }

      console.log('📊 Obteniendo métricas para org:', user.org_id)

      try {
        let query = supabase
          .from('analytics_metrics')
          .select('*')
          .eq('org_id', user.org_id)
          .order('created_at', { ascending: false })

        if (metricType) {
          query = query.eq('metric_type', metricType)
        }

        const { data, error } = await query

        if (error) {
          console.error('❌ Error fetching analytics metrics:', error)
          // Si hay conflicto (409), la tabla puede estar en uso, devolver vacío
          if (error.code === '409' || error.code === 'PGRST116') {
            console.log('⚠️ Conflicto al acceder a analytics_metrics, devolviendo datos vacíos')
            return []
          }
          throw error
        }

        console.log('✅ Métricas obtenidas:', data?.length || 0)
        return data || []
      } catch (error) {
        console.error('❌ Error en useAnalyticsMetrics:', error)
        return []
      }
    },
    enabled: !!user?.org_id,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const createMetric = useMutation({
    mutationFn: async (newMetric: Omit<AnalyticsMetric, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user?.org_id) throw new Error('No org_id disponible')

      const { data, error } = await supabase
        .from('analytics_metrics')
        .insert({
          ...newMetric,
          org_id: user.org_id
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-metrics'] })
      toast.success('Métrica creada correctamente')
    },
    onError: (error) => {
      console.error('❌ Error creando métrica:', error)
      toast.error('Error al crear la métrica')
    }
  })

  return {
    metrics,
    isLoading,
    error,
    createMetric: createMetric.mutate,
    isCreating: createMetric.isPending
  }
}
