
import { useQueryCache } from '@/hooks/cache/useQueryCache'
import { useApp } from '@/contexts/AppContext'
import { DashboardData, PerformanceData, RecentActivity } from '@/types/dashboardTypes'

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
          performanceData: [],
          upcomingTasks: []
        }
      }

      // Mock data con performance data
      const mockPerformanceData: PerformanceData[] = [
        { month: 'Ene', horas: 140, facturado: 120, objetivo: 160 },
        { month: 'Feb', horas: 155, facturado: 135, objetivo: 160 },
        { month: 'Mar', horas: 168, facturado: 150, objetivo: 160 },
        { month: 'Abr', horas: 145, facturado: 128, objetivo: 160 },
        { month: 'May', horas: 172, facturado: 158, objetivo: 160 },
        { month: 'Jun', horas: 165, facturado: 142, objetivo: 160 }
      ]

      const mockRecentActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'case',
          title: 'Nuevo caso creado',
          description: 'Consulta fiscal - Cliente ABC S.L.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          user: 'Usuario'
        },
        {
          id: '2',
          type: 'time_entry',
          title: 'Tiempo registrado',
          description: '2.5h en revisión contrato',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          user: 'Usuario'
        },
        {
          id: '3',
          type: 'client',
          title: 'Cliente actualizado',
          description: 'Datos de contacto de XYZ Corp',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          user: 'Usuario'
        }
      ]

      const mockData: DashboardData = {
        quickStats: {
          todayHours: Math.floor(Math.random() * 8),
          weekHours: Math.floor(Math.random() * 40),
          monthHours: Math.floor(Math.random() * 160),
          activeClients: Math.floor(Math.random() * 25) + 5
        },
        recentActivity: mockRecentActivity,
        performanceData: mockPerformanceData,
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
