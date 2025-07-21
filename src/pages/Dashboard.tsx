
import { useEffect, useState, useMemo } from 'react'
import { useApp } from '@/contexts/AppContext'
import { EnhancedDashboardMetrics } from '@/components/dashboard/EnhancedDashboardMetrics'
import { EnhancedDashboardLayout } from '@/components/dashboard/EnhancedDashboardLayout'
import { DashboardError } from '@/components/dashboard/DashboardError'
import { EnhancedActiveTimer } from '@/components/dashboard/EnhancedActiveTimer'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { MainLayout } from '@/components/layout/MainLayout'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function Dashboard() {
  const { user } = useApp()
  const { stats, isLoading, error, refetch } = useDashboardStats()
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    if (user?.org_id) {
      refetch()
      setLastRefresh(new Date())
    }
  }, [user, refetch])

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

  // OPTIMIZACIÓN: Memoizar transformación de stats costosa
  const enhancedStats = useMemo(() => {
    const totalHours = stats.totalBillableHours + stats.totalNonBillableHours
    const utilizationRate = totalHours > 0 ? 
      Math.round((stats.totalBillableHours / totalHours) * 100) : 0
    const estimatedRevenue = stats.totalBillableHours * 50 // €50/hora estimado
    
    return {
      totalTimeEntries: stats.totalTimeEntries,
      totalBillableHours: stats.totalBillableHours,
      totalClients: stats.totalContacts,
      totalCases: stats.totalCases,
      totalActiveCases: stats.activeCases,
      pendingInvoices: 0,
      hoursThisWeek: 0,
      hoursThisMonth: stats.thisMonthHours,
      utilizationRate,
      averageHoursPerDay: 0,
      totalRevenue: estimatedRevenue,
      pendingTasks: 0,
      overdueTasks: 0,
      loading: isLoading,
      error: error?.message || null
    }
  }, [
    stats.totalTimeEntries,
    stats.totalBillableHours,
    stats.totalNonBillableHours,
    stats.totalContacts,
    stats.totalCases,
    stats.activeCases,
    stats.thisMonthHours,
    isLoading,
    error
  ])

  // OPTIMIZACIÓN: Memoizar mensaje de bienvenida
  const welcomeMessage = useMemo(() => 
    user?.email?.split('@')[0] || 'Usuario',
    [user?.email]
  )

  // OPTIMIZACIÓN: Memoizar formato de tiempo
  const formatTime = useMemo(() => (date: Date) => 
    date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }), [])

  // OPTIMIZACIÓN: Memoizar badges
  const badges = useMemo(() => [
    {
      label: `Rol: ${user?.role}`,
      variant: 'outline' as const,
      color: 'text-blue-600 border-blue-200 bg-blue-50'
    }
  ], [user?.role])

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
    <MainLayout>
      <StandardPageContainer>
        <StandardPageHeader
          title={`Bienvenido, ${welcomeMessage}`}
          description="Panel de control inteligente con métricas en tiempo real"
          badges={badges}
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

        {/* Timer de trabajo activo */}
        <div className="mb-6">
          <EnhancedActiveTimer />
        </div>

        {/* Indicador de última actualización */}
        <div className="text-sm text-gray-500 mb-4">
          Última actualización: {formatTime(lastRefresh)}
        </div>
        
        {/* Métricas principales con diseño compacto */}
        <EnhancedDashboardMetrics stats={enhancedStats} />
        
        {/* Layout principal */}
        {!isLoading && <EnhancedDashboardLayout />}
        
        {error && (
          <DashboardError error={error.message || 'Error desconocido'} onRetry={refetch} />
        )}
      </StandardPageContainer>
    </MainLayout>
  )
}
