
import { useEffect, useState, useMemo } from 'react'
import { useApp } from '@/contexts/AppContext'
import { OptimizedDashboardLayout } from '@/components/dashboard/OptimizedDashboardLayout'
import { DashboardError } from '@/components/dashboard/DashboardError'
import { EnhancedActiveTimer } from '@/components/dashboard/EnhancedActiveTimer'
import { useParallelQueries } from '@/hooks/optimization/useParallelQueries'
import { useMemoizedMetrics } from '@/hooks/optimization/useMemoizedMetrics'
import { usePerformanceMonitor } from '@/hooks/optimization/usePerformanceMonitor'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { MainLayout } from '@/components/layout/MainLayout'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function Dashboard() {
  const { user } = useApp()
  const { data, isLoading, error, refetchAll } = useParallelQueries()
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const { metrics } = usePerformanceMonitor('Dashboard', 20)

  useEffect(() => {
    if (user?.org_id) {
      setLastRefresh(new Date())
    }
  }, [user])

  const handleRefresh = async () => {
    try {
      await refetchAll()
      setLastRefresh(new Date())
      toast.success('Dashboard actualizado', {
        description: 'Los datos se han actualizado correctamente'
      })
    } catch (error) {
      toast.error('Error al actualizar', {
        description: 'No se pudieron actualizar los datos'
      })
    }
  }

  // OPTIMIZACIÓN: Memoizar transformación de stats costosa
  const enhancedStats = useMemoizedMetrics(data || {
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
    loading: isLoading,
    error: error || null
  })

  // OPTIMIZACIÓN: Memoizar mensaje de bienvenida
  const welcomeMessage = useMemo(() => 
    user?.email?.split('@')[0] || 'Usuario',
    [user?.email]
  )

  // OPTIMIZACIÓN: Memoizar formato de tiempo
  const formatTime = useMemo(() => (date: Date) => 
    date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }), [])

  // OPTIMIZACIÓN: Memoizar badges
  const badges = useMemo(() => [
    {
      label: `Rol: ${user?.role}`,
      variant: 'outline' as const,
      color: 'text-blue-600 border-blue-200 bg-blue-50'
    }
  ], [user?.role])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <StandardPageContainer>
        <StandardPageHeader
          title={`Bienvenido, ${welcomeMessage}`}
          description="Panel de control inteligente con métricas en tiempo real"
          badges={badges}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          }
        />

        {/* Timer de trabajo activo */}
        <div className="mb-6">
          <EnhancedActiveTimer />
        </div>

        {/* Indicador de última actualización */}
        <div className="text-sm text-gray-500 mb-4 flex items-center justify-between">
          <span>Última actualización: {formatTime(lastRefresh)}</span>
          {process.env.NODE_ENV === 'development' && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {metrics.componentRenders} renders | {metrics.avgRenderTime.toFixed(1)}ms avg
            </span>
          )}
        </div>
        
        {/* Layout principal optimizado */}
        <OptimizedDashboardLayout />
        
        {error && (
          <DashboardError error={error} onRetry={refetchAll} />
        )}
      </StandardPageContainer>
    </MainLayout>
  )
}
