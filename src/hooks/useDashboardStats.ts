
import { useState, useCallback } from 'react'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'

interface DashboardStats {
  totalTimeEntries: number
  totalBillableHours: number
  totalClients: number
  totalCases: number
  totalActiveCases: number
  pendingInvoices: number
  hoursThisWeek: number
  hoursThisMonth: number
  utilizationRate: number
  averageHoursPerDay: number
  totalRevenue: number
  pendingTasks: number
  overdueTasks: number
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
    totalActiveCases: 0,
    pendingInvoices: 0,
    hoursThisWeek: 0,
    hoursThisMonth: 0,
    utilizationRate: 0,
    averageHoursPerDay: 0,
    totalRevenue: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    loading: true,
    error: null
  })

  const fetchStats = useCallback(async () => {
    if (!user?.org_id) {
      console.log('📊 No org_id disponible, omitiendo fetch de estadísticas')
      setStats(prev => ({ ...prev, loading: false }))
      return
    }

    try {
      console.log('📊 Obteniendo estadísticas para org:', user.org_id)
      setStats(prev => ({ ...prev, loading: true, error: null }))

      // Calcular fechas
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      // Obtener estadísticas de entradas de tiempo
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('duration_minutes, is_billable, created_at')

      if (timeError) {
        console.error('❌ Error obteniendo time_entries:', timeError)
        throw timeError
      }

      const totalTimeEntries = timeEntries?.length || 0
      const totalBillableMinutes = timeEntries
        ?.filter(entry => entry.is_billable)
        .reduce((acc, entry) => acc + (entry.duration_minutes || 0), 0) || 0
      const totalBillableHours = totalBillableMinutes / 60

      // Calcular horas de esta semana
      const weekEntries = timeEntries?.filter(entry => 
        new Date(entry.created_at) >= startOfWeek
      ) || []
      const hoursThisWeek = weekEntries.reduce((acc, entry) => 
        acc + (entry.duration_minutes || 0), 0
      ) / 60

      // Calcular horas de este mes
      const monthEntries = timeEntries?.filter(entry => 
        new Date(entry.created_at) >= startOfMonth
      ) || []
      const hoursThisMonth = monthEntries.reduce((acc, entry) => 
        acc + (entry.duration_minutes || 0), 0
      ) / 60

      // Calcular promedio de horas por día
      const daysThisMonth = Math.max(1, now.getDate())
      const averageHoursPerDay = hoursThisMonth / daysThisMonth

      // Calcular tasa de utilización (asumiendo 8h/día objetivo)
      const workingDaysThisMonth = Math.floor(daysThisMonth * 5/7) // Aproximación días laborables
      const expectedHours = workingDaysThisMonth * 8
      const utilizationRate = expectedHours > 0 ? (hoursThisMonth / expectedHours) * 100 : 0

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
        .select('id, status')

      if (casesError) {
        console.error('❌ Error obteniendo cases:', casesError)
        throw casesError
      }

      const totalCases = cases?.length || 0
      const totalActiveCases = cases?.filter(c => c.status === 'active')?.length || 0

      // Obtener estadísticas de tareas
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, status, due_date')

      if (tasksError) {
        console.error('❌ Error obteniendo tasks:', tasksError)
        throw tasksError
      }

      const pendingTasks = tasks?.filter(t => 
        t.status === 'pending' || t.status === 'in_progress'
      )?.length || 0

      const overdueTasks = tasks?.filter(t => 
        t.due_date && new Date(t.due_date) < now && t.status !== 'completed'
      )?.length || 0

      // Datos mock para campos que requieren integraciones futuras
      const mockData = {
        pendingInvoices: 3,
        totalRevenue: Math.round(totalBillableHours * 150) // Estimación a €150/hora
      }

      console.log('✅ Estadísticas obtenidas exitosamente')
      setStats(prev => ({
        ...prev,
        totalTimeEntries,
        totalBillableHours: Math.round(totalBillableHours * 100) / 100,
        totalClients: clients?.length || 0,
        totalCases,
        totalActiveCases,
        hoursThisWeek: Math.round(hoursThisWeek * 100) / 100,
        hoursThisMonth: Math.round(hoursThisMonth * 100) / 100,
        utilizationRate: Math.round(utilizationRate),
        averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
        pendingTasks,
        overdueTasks,
        ...mockData,
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
