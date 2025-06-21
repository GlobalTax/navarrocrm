
import { useState, useCallback } from 'react'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'

interface DashboardStats {
  totalTimeEntries: number
  totalBillableHours: number
  totalClients: number
  totalCases: number
  pendingInvoices: number
  hoursThisWeek: number
  utilizationRate: number
  loading: boolean
  error: string | null
}

export const useDashboardStats = () => {
  const { user } = useApp()
  const [stats, setStats] = useState<DashboardStats>({
    totalTimeEntries: 0,
    totalBillableHours: 0,
    totalClients: 0,
    totalCases: 0,
    pendingInvoices: 5, // Mock data
    hoursThisWeek: 32, // Mock data
    utilizationRate: 78, // Mock data
    loading: true,
    error: null
  })

  const fetchStats = useCallback(async () => {
    if (!user?.org_id) {
      console.log('📊 No org_id disponible, omitiendo fetch de estadísticas')
      return
    }

    try {
      console.log('📊 Obteniendo estadísticas para org:', user.org_id)
      setStats(prev => ({ ...prev, loading: true, error: null }))

      // Obtener estadísticas de entradas de tiempo
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('duration_minutes, is_billable')

      if (timeError) {
        console.error('❌ Error obteniendo time_entries:', timeError)
        throw timeError
      }

      const totalTimeEntries = timeEntries?.length || 0
      const totalBillableHours = timeEntries
        ?.filter(entry => entry.is_billable)
        .reduce((acc, entry) => acc + (entry.duration_minutes || 0), 0) / 60 || 0

      // Obtener estadísticas de clientes
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id')

      if (clientsError) {
        console.error('❌ Error obteniendo clients:', clientsError)
        throw clientsError
      }

      // Obtener estadísticas de casos
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('id')

      if (casesError) {
        console.error('❌ Error obteniendo cases:', casesError)
        throw casesError
      }

      console.log('✅ Estadísticas obtenidas exitosamente')
      setStats(prev => ({
        ...prev,
        totalTimeEntries,
        totalBillableHours: Math.round(totalBillableHours * 100) / 100,
        totalClients: clients?.length || 0,
        totalCases: cases?.length || 0,
        loading: false,
        error: null
      }))
    } catch (error: any) {
      console.error('❌ Error obteniendo estadísticas:', error)
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al cargar las estadísticas'
      }))
    }
  }, [user?.org_id])

  return { stats, fetchStats }
}
