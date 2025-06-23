
import { AIUsageStatsCards, AIUsageByOrgCard } from '@/components/admin/AIUsageStats'
import { AIUsageTable } from '@/components/admin/AIUsageTable'
import { AIAdminAlerts } from '@/components/admin/AIAdminAlerts'
import { AIAdminAccessDenied } from '@/components/admin/AIAdminAccessDenied'
import { AIAdminDashboard } from '@/components/ai-admin/AIAdminDashboard'
import { useAIAdminData } from '@/hooks/useAIAdminData'
import { subMonths, addMonths } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'

export default function AIAdmin() {
  const {
    isSuperAdmin,
    isLoadingRoles,
    selectedMonth,
    setSelectedMonth,
    usageData,
    isLoadingUsage
  } = useAIAdminData()

  // Verificar permisos
  if (isLoadingRoles) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isSuperAdmin) {
    return <AIAdminAccessDenied />
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
    costByOrg: {}
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Panel de Administración IA"
        description="Monitorea el uso, rendimiento y costos de los servicios de inteligencia artificial"
      >
        <div className="flex items-center gap-2">
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
        stats={usageData?.stats || defaultStats}
        isLoading={isLoadingUsage}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            Resumen
          </TabsTrigger>
          <TabsTrigger value="organizations">
            Organizaciones
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas
          </TabsTrigger>
          <TabsTrigger value="logs">
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AIUsageStatsCards 
            stats={usageData?.stats || defaultStats} 
            isLoading={isLoadingUsage} 
          />
        </TabsContent>

        <TabsContent value="organizations" className="space-y-6">
          <AIUsageByOrgCard 
            stats={usageData?.stats || defaultStats} 
            isLoading={isLoadingUsage} 
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <AIAdminAlerts 
            stats={usageData?.stats || defaultStats}
            isLoading={isLoadingUsage}
          />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <AIUsageTable 
            logs={usageData?.logs || []} 
            isLoading={isLoadingUsage} 
          />
        </TabsContent>
      </Tabs>
    </StandardPageContainer>
  )
}
