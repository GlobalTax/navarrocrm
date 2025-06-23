
import { useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { DashboardError } from '@/components/dashboard/DashboardError'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'

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

  const welcomeMessage = user?.email?.split('@')[0] || 'Usuario'

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title={`Bienvenido, ${welcomeMessage}`}
        description="Resumen ejecutivo de tu despacho de abogados"
        badges={[
          {
            label: `Rol: ${user.role}`,
            variant: 'outline',
            color: 'text-blue-600 border-blue-200 bg-blue-50'
          }
        ]}
      />
      
      <DashboardMetrics stats={stats} />
      <DashboardLayout />
      
      {stats.error && (
        <DashboardError error={stats.error} onRetry={fetchStats} />
      )}
    </StandardPageContainer>
  )
}
