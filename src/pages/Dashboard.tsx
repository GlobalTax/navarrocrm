
import { PremiumDashboardMetrics } from '@/components/dashboard/PremiumDashboardMetrics'
import { PremiumPageHeader } from '@/components/layout/PremiumPageHeader'
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from '@/components/ui/premium-card'
import { useDashboardData } from '@/hooks/useDashboardData'

export default function Dashboard() {
  const { data: dashboardData, isLoading } = useDashboardData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="premium-animate-in">
          <div className="text-premium-secondary">Cargando dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-premium-gray-5 p-6">
      <div className="max-w-7xl mx-auto premium-spacing-xl">
        <PremiumPageHeader
          title="Dashboard"
          description="Vista general de tu despacho y métricas principales"
        />

        <PremiumDashboardMetrics />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
          <PremiumCard className="premium-animate-slide-up">
            <PremiumCardHeader>
              <PremiumCardTitle>Actividad Reciente</PremiumCardTitle>
            </PremiumCardHeader>
            <PremiumCardContent>
              <div className="premium-spacing-sm">
                <div className="text-premium-secondary text-sm">
                  Los eventos recientes aparecerán aquí
                </div>
              </div>
            </PremiumCardContent>
          </PremiumCard>

          <PremiumCard className="premium-animate-slide-up" style={{ animationDelay: '100ms' }}>
            <PremiumCardHeader>
              <PremiumCardTitle>Próximas Tareas</PremiumCardTitle>
            </PremiumCardHeader>
            <PremiumCardContent>
              <div className="premium-spacing-sm">
                <div className="text-premium-secondary text-sm">
                  Las tareas próximas aparecerán aquí
                </div>
              </div>
            </PremiumCardContent>
          </PremiumCard>
        </div>
      </div>
    </div>
  )
}
