import { useEffect, useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { OptimizedDashboardMetrics } from '@/components/dashboard/OptimizedDashboardMetrics'
import { OptimizedPerformanceChart } from '@/components/dashboard/OptimizedPerformanceChart'
import { OptimizedRecentActivity } from '@/components/dashboard/OptimizedRecentActivity'
import { TodayAgenda } from '@/components/dashboard/TodayAgenda'
import { DashboardError } from '@/components/dashboard/DashboardError'
import { EnhancedActiveTimer } from '@/components/dashboard/EnhancedActiveTimer'
import { useDashboardMetrics } from '../hooks'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { LazyWidget } from '@/components/ui/lazy-widget'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { QuantumBillingStatusCard } from '@/components/quantum/QuantumBillingStatusCard'

export default function DashboardPage() {
  const { user } = useApp()
  const { data, isLoading, error, refetch } = useDashboardMetrics()
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    if (user?.org_id) {
      setLastRefresh(new Date())
    }
  }, [user])

  const handleRefresh = async () => {
    try {
      await refetch()
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
  const formatTime = (date: Date) => date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title={`Bienvenido, ${welcomeMessage}`}
        description="Panel de control optimizado con métricas en tiempo real"
        badges={[
          {
            label: `Rol: ${user.role}`,
            variant: 'outline',
            color: 'text-blue-600 border-blue-200 bg-blue-50'
          }
        ]}
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

      {/* Timer de trabajo activo - Carga inmediata */}
      <LazyWidget priority="immediate" className="mb-6">
        <EnhancedActiveTimer />
      </LazyWidget>

      {/* Indicador de última actualización */}
      <div className="text-sm text-gray-500 mb-4">
        Última actualización: {formatTime(lastRefresh)}
      </div>
      
      {/* Métricas principales optimizadas - Carga inmediata */}
      {data && (
        <LazyWidget priority="immediate">
          <OptimizedDashboardMetrics 
            data={data} 
            isLoading={isLoading}
            error={error?.message || null}
          />
        </LazyWidget>
      )}

      {/* Estado de Facturación Quantum visible aunque no haya datos del dashboard */}
      {(!data || isLoading) && (
        <LazyWidget priority="immediate" className="mb-6">
          <QuantumBillingStatusCard />
        </LazyWidget>
      )}

      
      {/* Layout principal optimizado con lazy loading */}
      {!isLoading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna izquierda - Agenda con delay */}
          <div className="lg:col-span-4 space-y-6">
            <LazyWidget priority="delayed">
              <TodayAgenda />
            </LazyWidget>
          </div>
          
          {/* Columna central - Gráficos con intersección */}
          <div className="lg:col-span-5 space-y-6">
            <LazyWidget priority="intersection">
              <OptimizedPerformanceChart data={data} isLoading={isLoading} />
            </LazyWidget>
          </div>
          
{/* Columna derecha - Actividad y estado de facturación */}
<div className="lg:col-span-3">
  <div className="space-y-6">
    <LazyWidget priority="intersection">
      <QuantumBillingStatusCard />
    </LazyWidget>
    <LazyWidget priority="intersection">
      <OptimizedRecentActivity data={data} isLoading={isLoading} />
    </LazyWidget>
  </div>
</div>
        </div>
      )}
      
      {error && (
        <DashboardError error={error.message || 'Error desconocido'} onRetry={refetch} />
      )}
    </StandardPageContainer>
  )
}