
import { useState } from 'react'
import { OptimizedPerformanceChart } from './OptimizedPerformanceChart'
import { OptimizedRecentActivity } from './OptimizedRecentActivity'
import { TodayAgenda } from './TodayAgenda'
import { DashboardFilters } from './DashboardFilters'
import { useDashboardMetrics } from '@/features/dashboard'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { VisibleCard } from '@/components/ui/VisibleCard'
import { useUIPreferences } from '@/hooks/useUIPreferences'

export const EnhancedDashboardLayout = () => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month')
  const { data, refetch, isLoading } = useDashboardMetrics()
  const { showKpis, toggleKpis } = useUIPreferences('dashboard', { showKpis: false })

  const handleRefresh = async () => {
    try {
      await refetch()
      toast.success('Dashboard actualizado correctamente')
    } catch (error) {
      toast.error('Error al actualizar el dashboard')
    }
  }

  return (
    <div className="space-y-6">
      <DashboardFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={handleRefresh}
        isRefreshing={isLoading}
      />

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={toggleKpis}>
          {showKpis ? 'Ocultar widgets' : 'Ver widgets'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna izquierda - Agenda */}
        <div className="lg:col-span-4 space-y-6">
          <TodayAgenda />
        </div>
        
        {/* Columna central - Gráficos de rendimiento */}
        {showKpis && (
          <div className="lg:col-span-5 space-y-6">
            {data && (
              <VisibleCard pageKey="dashboard" cardId="performance" title="Rendimiento">
                <OptimizedPerformanceChart data={data} isLoading={isLoading} />
              </VisibleCard>
            )}
          </div>
        )}
        
        {/* Columna derecha - Actividad reciente */}
        {showKpis && (
          <div className="lg:col-span-3">
            {data && (
              <VisibleCard pageKey="dashboard" cardId="recent-activity" title="Actividad reciente">
                <OptimizedRecentActivity data={data} isLoading={isLoading} />
              </VisibleCard>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
