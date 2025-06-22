
import { AIUsageStatsCards, AIUsageByOrgCard } from '@/components/admin/AIUsageStats'
import { AIUsageTable } from '@/components/admin/AIUsageTable'
import { AIAdminHeader } from '@/components/admin/AIAdminHeader'
import { AIAdminAlerts } from '@/components/admin/AIAdminAlerts'
import { AIAdminAccessDenied } from '@/components/admin/AIAdminAccessDenied'
import { useAIAdminData } from '@/hooks/useAIAdminData'
import { subMonths, addMonths } from 'date-fns'

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
      <AIAdminHeader
        selectedMonth={selectedMonth}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />

      <AIUsageStatsCards 
        stats={usageData?.stats || defaultStats} 
        isLoading={isLoadingUsage} 
      />

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AIUsageByOrgCard 
            stats={usageData?.stats || defaultStats} 
            isLoading={isLoadingUsage} 
          />
        </div>
        
        <div className="lg:col-span-2">
          <AIAdminAlerts 
            stats={usageData?.stats || defaultStats}
            isLoading={isLoadingUsage}
          />
        </div>
      </div>

      <AIUsageTable 
        logs={usageData?.logs || []} 
        isLoading={isLoadingUsage} 
      />
    </div>
  )
}
