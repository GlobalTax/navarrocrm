
import { useState, Suspense } from 'react'
import { LazyPerformanceChart } from '@/components/charts/LazyPerformanceChart'
import { OptimizedRecentActivity } from './OptimizedRecentActivity'
import { TodayAgenda } from './TodayAgenda'
import { DashboardFilters } from './DashboardFilters'
import { useParallelQueries } from '@/hooks/optimization/useParallelQueries'
import { useMemoizedMetrics } from '@/hooks/optimization/useMemoizedMetrics'
import { usePerformanceMonitor } from '@/hooks/optimization/usePerformanceMonitor'
import { EnhancedDashboardMetrics } from './EnhancedDashboardMetrics'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export const OptimizedDashboardLayout = () => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month')
  const { data, isLoading, error, refetchAll, isFetching } = useParallelQueries()
  const { metrics } = usePerformanceMonitor('OptimizedDashboardLayout')

  // Usar datos memoizados solo si están disponibles
  const memoizedMetrics = useMemoizedMetrics(data || {
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

  const handleRefresh = async () => {
    try {
      await refetchAll()
      toast.success('Dashboard actualizado correctamente')
    } catch (error) {
      toast.error('Error al actualizar el dashboard')
    }
  }

  // Skeleton optimizado para layout completo
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        
        {/* Skeleton para métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>

        {/* Skeleton para layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Skeleton className="h-96 rounded-xl" />
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-96 rounded-xl" />
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
      />

      {/* Métricas optimizadas */}
      <EnhancedDashboardMetrics stats={memoizedMetrics.enhancedStats} />

      {/* Layout principal con lazy loading */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna izquierda - Agenda */}
        <div className="lg:col-span-4 space-y-6">
          <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
            <TodayAgenda />
          </Suspense>
        </div>
        
        {/* Columna central - Gráficos de rendimiento */}
        <div className="lg:col-span-5 space-y-6">
          <LazyPerformanceChart />
        </div>
        
        {/* Columna derecha - Actividad reciente */}
        <div className="lg:col-span-3">
          <OptimizedRecentActivity />
        </div>
      </div>

      {/* Métricas de performance en desarrollo */}
      {process.env.NODE_ENV === 'development' && metrics.componentRenders > 100 && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 p-2 rounded text-xs">
          Performance: {metrics.componentRenders} renders, {metrics.avgRenderTime.toFixed(1)}ms avg
        </div>
      )}
    </div>
  )
}
