
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
        // Obtener casos
        const { data: cases, error: casesError } = await supabase
          .from('cases')
          .select('id, status, created_at')

        if (casesError) {
          console.error('❌ Error obteniendo casos:', casesError)
          throw casesError
        }

        // Obtener contactos
        const { data: contacts, error: contactsError } = await supabase
          .from('contacts')
          .select('id, created_at')

        if (contactsError) {
          console.error('❌ Error obteniendo contactos:', contactsError)
          throw contactsError
        }

        // Obtener entradas de tiempo
        const { data: timeEntries, error: timeError } = await supabase
          .from('time_entries')
          .select('duration_minutes, is_billable, created_at')

        if (timeError) {
          console.error('❌ Error obteniendo entradas de tiempo:', timeError)
          throw timeError
        }

        // Calcular estadísticas
        const totalCases = cases?.length || 0
        const activeCases = cases?.filter(c => c.status === 'open').length || 0
        const totalContacts = contacts?.length || 0
        const totalTimeEntries = timeEntries?.length || 0

        const totalBillableMinutes = timeEntries?.filter(t => t.is_billable).reduce((sum, t) => sum + t.duration_minutes, 0) || 0
        const totalNonBillableMinutes = timeEntries?.filter(t => !t.is_billable).reduce((sum, t) => sum + t.duration_minutes, 0) || 0

        const totalBillableHours = Math.round((totalBillableMinutes / 60) * 100) / 100
        const totalNonBillableHours = Math.round((totalNonBillableMinutes / 60) * 100) / 100

        // Estadísticas del mes actual
        const currentMonth = new Date()
        currentMonth.setDate(1)
        currentMonth.setHours(0, 0, 0, 0)

        const thisMonthCases = cases?.filter(c => new Date(c.created_at) >= currentMonth).length || 0
        const thisMonthContacts = contacts?.filter(c => new Date(c.created_at) >= currentMonth).length || 0
        
        const thisMonthTimeEntries = timeEntries?.filter(t => new Date(t.created_at) >= currentMonth) || []
        const thisMonthMinutes = thisMonthTimeEntries.reduce((sum, t) => sum + t.duration_minutes, 0)
        const thisMonthHours = Math.round((thisMonthMinutes / 60) * 100) / 100

        const stats = {
          totalCases,
          activeCases,
          totalContacts,
          totalTimeEntries,
          totalBillableHours,
          totalNonBillableHours,
          thisMonthCases,
          thisMonthContacts,
          thisMonthHours,
        }

        console.log('✅ Estadísticas calculadas:', stats)
        return stats

      } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error)
        throw error
      }
    },
    enabled: !!user?.org_id,
  })

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
