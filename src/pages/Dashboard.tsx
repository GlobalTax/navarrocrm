
import { useEffect, useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { CleanDashboardLayout } from '@/components/dashboard/CleanDashboardLayout'
import { DashboardError } from '@/components/dashboard/DashboardError'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function Dashboard() {
  const { user, authLoading } = useApp()
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Verificar si hay usuario antes de cargar estadísticas
  const shouldLoadStats = Boolean(user && user.org_id)
  const { stats, isLoading, error, refetch } = useDashboardStats()

  useEffect(() => {
    if (shouldLoadStats) {
      refetch()
      setLastRefresh(new Date())
    }
  }, [user, refetch, shouldLoadStats])

  const handleRefresh = async () => {
    try {
      await refetch()
      setLastRefresh(new Date())
      toast.success('Dashboard actualizado', {
        description: 'Los datos se han actualizado correctamente'
      })
    } catch (error) {
      console.error('Dashboard: Error refreshing:', error)
      toast.error('Error al actualizar', {
        description: 'No se pudieron actualizar los datos'
      })
    }
  }

  // Mostrar loading mientras se carga la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuario...</p>
        </div>
      </div>
    )
  }

  if (!user.org_id) {
    return (
      <StandardPageContainer>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Configuración de Organización Requerida
              </h3>
              <p className="text-gray-600 mb-6">
                Tu cuenta no está asociada a ninguna organización. Esto puede deberse a que el sistema aún no ha completado la configuración inicial.
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={() => window.location.reload()} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Recargar página
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/setup'} className="w-full">
                Ir a configuración
              </Button>
            </div>
          </div>
        </div>
      </StandardPageContainer>
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
        description="Panel de control con métricas en tiempo real"
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

      {/* Indicador de última actualización */}
      <div className="text-sm text-gray-500 mb-6">
        Última actualización: {formatTime(lastRefresh)}
      </div>
      
      {/* Contenido principal */}
      {isLoading ? (
        <DashboardLoadingSkeleton />
      ) : error ? (
        <DashboardError error={error.message || 'Error desconocido'} onRetry={refetch} />
      ) : (
        <CleanDashboardLayout />
      )}
    </StandardPageContainer>
  )
}

// Componente de skeleton optimizado
const DashboardLoadingSkeleton = () => (
  <div className="space-y-8">
    {/* Timer skeleton */}
    <Skeleton className="h-16 w-full" />
    
    {/* Métricas skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    
    {/* Layout principal skeleton */}
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <Skeleton className="xl:col-span-4 h-96" />
      <Skeleton className="xl:col-span-5 h-96" />
      <Skeleton className="xl:col-span-3 h-96" />
    </div>
  </div>
)
