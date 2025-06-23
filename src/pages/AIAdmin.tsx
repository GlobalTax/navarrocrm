
import { AIUsageStatsCards, AIUsageByOrgCard } from '@/components/admin/AIUsageStats'
import { AIUsageTable } from '@/components/admin/AIUsageTable'
import { AIAdminHeader } from '@/components/admin/AIAdminHeader'
import { AIAdminAlerts } from '@/components/admin/AIAdminAlerts'
import { AIAdminAccessDenied } from '@/components/admin/AIAdminAccessDenied'
import { AIAdminDashboard } from '@/components/ai-admin/AIAdminDashboard'
import { useAIAdminData } from '@/hooks/useAIAdminData'
import { subMonths, addMonths } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, AlertCircle, Database, Settings } from 'lucide-react'

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
    <div className="container mx-auto py-8 space-y-8">
      {/* Header mejorado */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración IA</h1>
        <p className="text-gray-600 mt-2">
          Monitorea el uso, rendimiento y costos de los servicios de inteligencia artificial
        </p>
      </div>

      <AIAdminHeader
        selectedMonth={selectedMonth}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />

      {/* Dashboard principal */}
      <AIAdminDashboard
        stats={usageData?.stats || defaultStats}
        isLoading={isLoadingUsage}
      />

      {/* Tabs organizadas */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Resumen</span>
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Organizaciones</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Alertas</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Logs</span>
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
    </div>
  )
}
