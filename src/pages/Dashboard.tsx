
import { MainLayout } from '@/components/layout/MainLayout'
import { DashboardAuthGuard } from '@/components/dashboard/DashboardAuthGuard'
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
    handleRefresh
  } = useDashboardState()

  return (
    <DashboardAuthGuard user={user} authLoading={authLoading}>
      <MainLayout>
        {isLoading ? (
          <DashboardLoadingState />
        ) : error ? (
          <DashboardError error={error.message || 'Error desconocido'} onRetry={handleRefresh} />
        ) : (
          <CleanDashboardLayout />
        )}
      </MainLayout>
    </DashboardAuthGuard>
  )
}
