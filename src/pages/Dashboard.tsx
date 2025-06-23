
import { useEffect, useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { EnhancedDashboardMetrics } from '@/components/dashboard/EnhancedDashboardMetrics'
import { EnhancedDashboardLayout } from '@/components/dashboard/EnhancedDashboardLayout'
import { DashboardError } from '@/components/dashboard/DashboardError'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function Dashboard() {
  const { user } = useApp()
  const { stats, fetchStats } = useDashboardStats()
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    if (user?.org_id) {
      fetchStats()
      setLastRefresh(new Date())
    }
  }, [user, fetchStats])

  const handleRefresh = async () => {
    try {
      await fetchStats()
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
        description="Panel de control inteligente con métricas en tiempo real"
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
            disabled={stats.loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${stats.loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        }
      />

      {/* Indicador de última actualización */}
      <div className="text-sm text-gray-500 mb-4">
        Última actualización: {formatTime(lastRefresh)}
      </div>
      
      {/* Contenido principal */}
      {stats.loading ? (
        <DashboardLoadingSkeleton />
      ) : (
        <>
          <EnhancedDashboardMetrics stats={stats} />
          <EnhancedDashboardLayout />
        </>
      )}
      
      {stats.error && (
        <DashboardError error={stats.error} onRetry={fetchStats} />
      )}
    </StandardPageContainer>
  )
}

// Componente de skeleton para loading
const DashboardLoadingSkeleton = () => (
  <div className="space-y-6">
    {/* Active Timer Skeleton */}
    <Skeleton className="h-16 w-full" />
    
    {/* Métricas principales skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    
    {/* Métricas adicionales skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    
    {/* Layout skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Skeleton className="lg:col-span-4 h-64" />
      <Skeleton className="lg:col-span-5 h-64" />
      <Skeleton className="lg:col-span-3 h-64" />
    </div>
  </div>
)
