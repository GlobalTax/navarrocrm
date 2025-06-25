
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
  const { user, authLoading } = useApp()
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  console.log('Dashboard: Rendering with user:', user)
  console.log('Dashboard: Auth loading:', authLoading)

  // Verificar si hay usuario antes de cargar estadísticas
  const shouldLoadStats = Boolean(user && user.org_id)
  console.log('Dashboard: Should load stats:', shouldLoadStats, 'User org_id:', user?.org_id)

  const { stats, isLoading, error, refetch } = useDashboardStats()

  console.log('Dashboard: Stats loaded:', { stats, isLoading, error })

  useEffect(() => {
    if (shouldLoadStats) {
      console.log('Dashboard: Fetching stats for user:', user?.id)
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
    console.log('Dashboard: Auth loading, showing loading state')
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
    console.log('Dashboard: No user found, showing loading')
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
    console.log('Dashboard: User has no org_id:', user)
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

  // Convert stats to match EnhancedDashboardMetrics interface
  const enhancedStats = stats ? {
    totalTimeEntries: stats.totalTimeEntries || 0,
    totalBillableHours: stats.totalBillableHours || 0,
    totalClients: stats.totalContacts || 0,
    totalCases: stats.totalCases || 0,
    totalActiveCases: stats.activeCases || 0,
    pendingInvoices: 0,
    hoursThisWeek: 0,
    hoursThisMonth: stats.thisMonthHours || 0,
    utilizationRate: stats.totalTimeEntries > 0 ? Math.round((stats.totalBillableHours / (stats.totalBillableHours + stats.totalNonBillableHours)) * 100) : 0,
    averageHoursPerDay: 0,
    totalRevenue: (stats.totalBillableHours || 0) * 50, // Estimated at €50/hour
    pendingTasks: 0,
    overdueTasks: 0,
    loading: isLoading,
    error: error?.message || null
  } : null

  console.log('Dashboard: Enhanced stats:', enhancedStats)

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
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        }
      />

      {/* Indicador de última actualización */}
      <div className="text-sm text-gray-500 mb-4">
        Última actualización: {formatTime(lastRefresh)}
      </div>
      
      {/* Contenido principal */}
      {isLoading ? (
        <DashboardLoadingSkeleton />
      ) : error ? (
        <DashboardError error={error.message || 'Error desconocido'} onRetry={refetch} />
      ) : enhancedStats ? (
        <>
          <EnhancedDashboardMetrics stats={enhancedStats} />
          <EnhancedDashboardLayout />
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No se pudieron cargar las estadísticas</p>
          <Button variant="outline" onClick={handleRefresh} className="mt-4">
            Reintentar
          </Button>
        </div>
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
