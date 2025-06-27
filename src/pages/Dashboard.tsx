
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { DashboardAuthGuard } from '@/components/dashboard/DashboardAuthGuard'
import { DashboardHeaderSection } from '@/components/dashboard/DashboardHeaderSection'
import { DashboardLoadingState } from '@/components/dashboard/DashboardLoadingState'
import { DashboardError } from '@/components/dashboard/DashboardError'
import { EnhancedDashboardMetrics } from '@/components/dashboard/EnhancedDashboardMetrics'
import { TodayAgenda } from '@/components/dashboard/TodayAgenda'
import { EnhancedPerformanceChart } from '@/components/dashboard/EnhancedPerformanceChart'
import { EnhancedRecentActivity } from '@/components/dashboard/EnhancedRecentActivity'
import { useDashboardState } from '@/hooks/dashboard/useDashboardState'
import { useDashboardStats } from '@/hooks/useDashboardStats'

export default function Dashboard() {
  const {
    user,
    authLoading,
    isLoading: stateLoading,
    error: stateError,
    lastRefresh,
    handleRefresh,
    formatTime
  } = useDashboardState()

  const { stats, isLoading: statsLoading, error: statsError } = useDashboardStats()

  const isLoading = stateLoading || statsLoading
  const error = stateError || statsError

  return (
    <DashboardAuthGuard user={user} authLoading={authLoading}>
      <StandardPageContainer>
        <DashboardHeaderSection
          user={user!}
          lastRefresh={lastRefresh}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          formatTime={formatTime}
        />
        
        {isLoading ? (
          <DashboardLoadingState />
        ) : error ? (
          <DashboardError error={error.message || 'Error desconocido'} onRetry={handleRefresh} />
        ) : (
          <div className="space-y-8">
            {/* Métricas principales del dashboard - como estaba antes */}
            <EnhancedDashboardMetrics stats={stats} />
            
            {/* Layout de 3 columnas - exactamente como estaba antes */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Columna izquierda - Agenda */}
              <div className="xl:col-span-4 space-y-6">
                <TodayAgenda />
              </div>
              
              {/* Columna central - Gráfico de rendimiento */}
              <div className="xl:col-span-5 space-y-6">
                <EnhancedPerformanceChart />
              </div>
              
              {/* Columna derecha - Actividad reciente */}
              <div className="xl:col-span-3 space-y-6">
                <EnhancedRecentActivity />
              </div>
            </div>
          </div>
        )}
      </StandardPageContainer>
    </DashboardAuthGuard>
  )
}
