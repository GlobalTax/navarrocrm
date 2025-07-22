import { AIUsageStatsCards, AIUsageByOrgCard } from '@/components/admin/AIUsageStats'
import { AIUsageTable } from '@/components/admin/AIUsageTable'
import { EnhancedAIAdminAlerts } from '@/components/admin/EnhancedAIAdminAlerts'
import { AIAdminAccessDenied } from '@/components/admin/AIAdminAccessDenied'
import { AIAdminDashboard } from '@/components/ai-admin/AIAdminDashboard'
import { AIUsageTrendsChart } from '@/components/admin/AIUsageTrendsChart'
import { AITopUsersTable } from '@/components/admin/AITopUsersTable'
import { SuperAdminCreator } from '@/components/admin/SuperAdminCreator'
import { useAIAdminData } from '@/hooks/useAIAdminData'
import { subMonths, addMonths } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { AINotificationSettings } from '@/components/admin/AINotificationSettings'
import { ScheduledReportsManager } from '@/components/admin/ScheduledReportsManager'

export default function AIAdmin() {
  const {
    isSuperAdmin,
    isLoadingRoles,
    selectedMonth,
    setSelectedMonth,
    enhancedData,
    isLoadingUsage
  } = useAIAdminData()

  const [showSettings, setShowSettings] = useState(false)

  // Verificar permisos
  if (isLoadingRoles) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <StandardPageContainer>
        <div className="space-y-6">
          <AIAdminAccessDenied />
          
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Crear Super Admin</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Si eres el administrador del sistema, puedes asignarte el rol de Super Admin para acceder al panel.
            </p>
            <SuperAdminCreator />
          </div>
        </div>
      </StandardPageContainer>
    )
  }

  const handlePreviousMonth = () => {
    setSelectedMonth(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setSelectedMonth(prev => addMonths(prev, 1))
  }

  const defaultStats = {
    totalCalls: 0,
    totalTokens: 0,
    totalCost: 0,
    successRate: 0,
    avgDuration: 0,
    callsByOrg: {},
    tokensByOrg: {},
    costByOrg: {},
    monthlyTrends: [],
    topUsers: [],
    modelPerformance: [],
    anomalies: []
  }

  const stats = enhancedData || defaultStats

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Panel de Administración IA"
        description="Monitoreo inteligente del uso, rendimiento y costos de los servicios de IA"
      >
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePreviousMonth}
            size="sm"
          >
            Anterior
          </Button>
          <span className="text-sm font-medium px-3">
            {selectedMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </span>
          <Button 
            variant="outline" 
            onClick={handleNextMonth}
            size="sm"
          >
            Siguiente
          </Button>
        </div>
      </StandardPageHeader>

      <AIAdminDashboard
        stats={stats}
        isLoading={isLoadingUsage}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">
            Resumen
          </TabsTrigger>
          <TabsTrigger value="trends">
            Tendencias
          </TabsTrigger>
          <TabsTrigger value="users">
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="organizations">
            Organizaciones
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas
          </TabsTrigger>
          <TabsTrigger value="reports">
            Reportes
          </TabsTrigger>
          <TabsTrigger value="settings">
            Configuración
          </TabsTrigger>
          <TabsTrigger value="logs">
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AIUsageStatsCards 
            stats={stats} 
            isLoading={isLoadingUsage} 
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <AIUsageTrendsChart 
            stats={stats}
            isLoading={isLoadingUsage}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <AITopUsersTable
            stats={stats}
            isLoading={isLoadingUsage}
          />
        </TabsContent>

        <TabsContent value="organizations" className="space-y-6">
          <AIUsageByOrgCard 
            stats={stats} 
            isLoading={isLoadingUsage} 
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <EnhancedAIAdminAlerts 
            stats={stats}
            isLoading={isLoadingUsage}
            onOpenSettings={() => setShowSettings(true)}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ScheduledReportsManager />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <AINotificationSettings />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <AIUsageTable 
            logs={[]} 
            isLoading={isLoadingUsage} 
          />
        </TabsContent>
      </Tabs>
    </StandardPageContainer>
  )
}
