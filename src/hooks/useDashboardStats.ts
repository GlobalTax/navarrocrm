
import { useQueryCache } from '@/hooks/cache/useQueryCache'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { DashboardStats } from '@/types/dashboardTypes'
import { getDashboardStatsFallback } from '@/services/dashboardStatsService'
import { useCallback } from 'react'

interface DashboardStatsResponse {
  totalCases: number
  activeCases: number
  totalContacts: number
  totalTimeEntries: number
  totalBillableHours: number
  totalNonBillableHours: number
  thisMonthCases: number
  thisMonthContacts: number
  thisMonthHours: number
}

export const useDashboardStats = () => {
  const { user } = useApp()

  // Estabilizar la query function
  const queryFunction = useCallback(async (): Promise<DashboardStats> => {
    if (!user?.org_id) {
      console.log('📊 No org_id disponible para obtener estadísticas')
      return {
        totalCases: 0,
        activeCases: 0,
        totalContacts: 0,
        totalTimeEntries: 0,
        totalBillableHours: 0,
        totalNonBillableHours: 0,
        thisMonthCases: 0,
        thisMonthContacts: 0,
        thisMonthHours: 0,
      }
    }

    console.log('📊 Obteniendo estadísticas para org:', user.org_id)

    try {
      // Usar la función RPC optimizada que retorna JSON
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_dashboard_stats', { 
          org_id_param: user.org_id,
          current_month: new Date().toISOString().slice(0, 7) // YYYY-MM
        })

      if (statsError) {
        console.error('❌ Error obteniendo estadísticas:', statsError)
        throw statsError
      }

      // La función ahora retorna JSON directamente
      if (!statsData) {
        console.log('📊 Usando fallback para estadísticas')
        return await getDashboardStatsFallback(user.org_id)
      }

      // Hacer type assertion segura usando unknown primero
      const typedStatsData = statsData as unknown as DashboardStatsResponse

      const result = {
        totalCases: typedStatsData.totalCases || 0,
        activeCases: typedStatsData.activeCases || 0,
        totalContacts: typedStatsData.totalContacts || 0,
        totalTimeEntries: typedStatsData.totalTimeEntries || 0,
        totalBillableHours: Math.round((typedStatsData.totalBillableHours || 0) * 100) / 100,
        totalNonBillableHours: Math.round((typedStatsData.totalNonBillableHours || 0) * 100) / 100,
        thisMonthCases: typedStatsData.thisMonthCases || 0,
        thisMonthContacts: typedStatsData.thisMonthContacts || 0,
        thisMonthHours: Math.round((typedStatsData.thisMonthHours || 0) * 100) / 100,
      }

      console.log('✅ Estadísticas obtenidas y cacheadas:', result)
      return result

    } catch (error) {
      console.error('❌ Error en consulta de estadísticas:', error)
      // Fallback a consultas individuales
      return await getDashboardStatsFallback(user.org_id)
    }
  }, [user?.org_id])

  const { data: stats, isLoading, error, refetch, invalidate } = useQueryCache(
    `dashboard-stats-${user?.org_id || 'no-org'}`,
    queryFunction,
    {
      ttl: 5 * 60 * 1000, // 5 minutos en cache
      staleTime: 30 * 1000, // 30 segundos stale time
      priority: 'high', // Alta prioridad para dashboard
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      enableCaching: true,
      preload: true // Precargar datos críticos
    }
  )

  return {
    stats: stats || {
      totalCases: 0,
      activeCases: 0,
      totalContacts: 0,
      totalTimeEntries: 0,
      totalBillableHours: 0,
      totalNonBillableHours: 0,
      thisMonthCases: 0,
      thisMonthContacts: 0,
      thisMonthHours: 0,
    },
    isLoading,
    error,
    refetch,
    invalidate
  }
}
