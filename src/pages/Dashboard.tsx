
import { useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { DashboardError } from '@/components/dashboard/DashboardError'
import { useDashboardStats } from '@/hooks/useDashboardStats'

export default function Dashboard() {
  const { user } = useApp()
  const { stats, fetchStats } = useDashboardStats()

  useEffect(() => {
    if (user?.org_id) {
      fetchStats()
    }
  }, [user, fetchStats])

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
    <div className="space-y-6">
      <DashboardHeader user={user} />
      <DashboardMetrics stats={stats} />
      <DashboardLayout />
      {stats.error && (
        <DashboardError error={stats.error} onRetry={fetchStats} />
      )}
    </div>
  )
}
