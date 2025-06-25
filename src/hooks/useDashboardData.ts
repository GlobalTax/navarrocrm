
import { useQueryCache } from '@/hooks/cache/useQueryCache'
import { useApp } from '@/contexts/AppContext'

interface DashboardData {
  quickStats: {
    todayHours: number
    weekHours: number
    monthHours: number
    activeClients: number
  }
  recentActivity: Array<{
    id: string
    type: 'case' | 'task' | 'time_entry'
    title: string
    timestamp: Date
    user: string
  }>
  upcomingTasks: Array<{
    id: string
    title: string
    dueDate: Date
    priority: 'low' | 'medium' | 'high' | 'urgent'
    case?: string
  }>
}

export const useDashboardData = (dateRange: 'week' | 'month' | 'quarter' = 'month') => {
  const { user } = useApp()

  const { data, isLoading, error, refetch } = useQueryCache(
    `dashboard-data-${user?.org_id}-${dateRange}`,
    async (): Promise<DashboardData> => {
      if (!user?.org_id) {
        return {
          quickStats: {
            todayHours: 0,
            weekHours: 0,
            monthHours: 0,
            activeClients: 0
          },
          recentActivity: [],
          upcomingTasks: []
        }
      }

      // Calcular fechas según el rango
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      // Simular datos por ahora - aquí irían las consultas reales
      const mockData: DashboardData = {
        quickStats: {
          todayHours: Math.floor(Math.random() * 8),
          weekHours: Math.floor(Math.random() * 40),
          monthHours: Math.floor(Math.random() * 160),
          activeClients: Math.floor(Math.random() * 25) + 5
        },
        recentActivity: [
          {
            id: '1',
            type: 'case',
            title: 'Nuevo caso creado: Consulta fiscal',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            user: 'Usuario'
          },
          {
            id: '2',
            type: 'time_entry',
            title: 'Tiempo registrado: 2.5h en revisión contrato',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            user: 'Usuario'
          }
        ],
        upcomingTasks: [
          {
            id: '1',
            title: 'Revisar documentación fiscal',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            priority: 'high',
            case: 'Caso 2025-001'
          },
          {
            id: '2',
            title: 'Llamada con cliente',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            priority: 'medium'
          }
        ]
      }

      console.log('📊 Dashboard data loaded and cached')
      return mockData
    },
    {
      ttl: 3 * 60 * 1000, // 3 minutos
      staleTime: 60 * 1000, // 1 minuto
      refetchOnMount: true
    }
  )

  return {
    data,
    isLoading,
    error,
    refetch,
    isRefetching: isLoading
  }
}
