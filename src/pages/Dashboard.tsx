
import { useEffect, useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { DashboardError } from '@/components/dashboard/DashboardError'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    await fetchStats()
    setLastRefresh(new Date())
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
        description="Resumen ejecutivo de tu despacho de abogados"
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
          <DashboardMetrics stats={stats} />
          <DashboardLayout />
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
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
