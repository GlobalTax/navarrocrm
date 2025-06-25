
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface DashboardStats {
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

// Tipo para la respuesta JSON de la función RPC
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

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats', user?.org_id],
    queryFn: async (): Promise<DashboardStats> => {
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
          return await getStatsFallback(user.org_id)
        }

        // Hacer type assertion para que TypeScript entienda el tipo
        const typedStatsData = statsData as DashboardStatsResponse

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

        console.log('✅ Estadísticas obtenidas:', result)
        return result

      } catch (error) {
        console.error('❌ Error en consulta de estadísticas:', error)
        // Fallback a consultas individuales
        return await getStatsFallback(user.org_id)
      }
    },
    enabled: !!user?.org_id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })

  // Función fallback para cuando no existe la función RPC
  const getStatsFallback = async (orgId: string): Promise<DashboardStats> => {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Consultas paralelas para mejor performance
    const [casesResult, contactsResult, timeEntriesResult] = await Promise.all([
      supabase
        .from('cases')
        .select('id, status, created_at')
        .eq('org_id', orgId),
      supabase
        .from('contacts')
        .select('id, created_at')
        .eq('org_id', orgId),
      supabase
        .from('time_entries')
        .select('duration_minutes, is_billable, created_at')
        .eq('org_id', orgId)
    ])

    if (casesResult.error) throw casesResult.error
    if (contactsResult.error) throw contactsResult.error
    if (timeEntriesResult.error) throw timeEntriesResult.error

    const cases = casesResult.data || []
    const contacts = contactsResult.data || []
    const timeEntries = timeEntriesResult.data || []

    // Calcular estadísticas
    const totalCases = cases.length
    const activeCases = cases.filter(c => c.status === 'open').length
    const totalContacts = contacts.length
    const totalTimeEntries = timeEntries.length

    const totalBillableHours = timeEntries
      .filter(te => te.is_billable)
      .reduce((sum, te) => sum + (te.duration_minutes / 60), 0)

    const totalNonBillableHours = timeEntries
      .filter(te => !te.is_billable)
      .reduce((sum, te) => sum + (te.duration_minutes / 60), 0)

    const thisMonthCases = cases.filter(c => 
      new Date(c.created_at) >= startOfMonth
    ).length

    const thisMonthContacts = contacts.filter(c => 
      new Date(c.created_at) >= startOfMonth
    ).length

    const thisMonthHours = timeEntries
      .filter(te => new Date(te.created_at) >= startOfMonth)
      .reduce((sum, te) => sum + (te.duration_minutes / 60), 0)

    return {
      totalCases,
      activeCases,
      totalContacts,
      totalTimeEntries,
      totalBillableHours: Math.round(totalBillableHours * 100) / 100,
      totalNonBillableHours: Math.round(totalNonBillableHours * 100) / 100,
      thisMonthCases,
      thisMonthContacts,
      thisMonthHours: Math.round(thisMonthHours * 100) / 100,
    }
  }

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
    refetch
  }
}
