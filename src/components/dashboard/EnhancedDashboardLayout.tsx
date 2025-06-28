
import { useState } from 'react'
import { EnhancedPerformanceChart } from './EnhancedPerformanceChart'
import { EnhancedRecentActivity } from './EnhancedRecentActivity'
import { TodayAgenda } from './TodayAgenda'
import { DashboardFilters } from './DashboardFilters'
import { useDashboardData } from '@/hooks/useDashboardData'
import { toast } from 'sonner'

export const EnhancedDashboardLayout = () => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month')
  const { refetch, isRefetching } = useDashboardData(dateRange)

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
        isRefreshing={isRefetching}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna izquierda - Agenda */}
        <div className="lg:col-span-4 space-y-6">
          <TodayAgenda />
        </div>
        
        {/* Columna central - Gráficos de rendimiento */}
        <div className="lg:col-span-5 space-y-6">
          <EnhancedPerformanceChart />
        </div>
        
        {/* Columna derecha - Actividad reciente */}
        <div className="lg:col-span-3">
          <EnhancedRecentActivity />
        </div>
      </div>
    </div>
  )
}
