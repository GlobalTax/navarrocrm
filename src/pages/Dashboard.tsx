
import { MainLayout } from '@/components/layout/MainLayout'
import { DashboardAuthGuard } from '@/components/dashboard/DashboardAuthGuard'
import { DashboardHeaderSection } from '@/components/dashboard/DashboardHeaderSection'
import { DashboardLoadingState } from '@/components/dashboard/DashboardLoadingState'
import { DashboardError } from '@/components/dashboard/DashboardError'
import { CleanDashboardLayout } from '@/components/dashboard/CleanDashboardLayout'
import { useDashboardState } from '@/hooks/dashboard/useDashboardState'

export default function Dashboard() {
  const {
    user,
    authLoading,
    isLoading,
    error,
    lastRefresh,
    handleRefresh,
    formatTime
  } = useDashboardState()

  return (
    <DashboardAuthGuard user={user} authLoading={authLoading}>
      <MainLayout>
        <div className="space-y-6">
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
            <CleanDashboardLayout />
          )}
        </div>
      </MainLayout>
    </DashboardAuthGuard>
  )
}
