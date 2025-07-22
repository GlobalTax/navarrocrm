
import { useMemo } from 'react'
import { useOptimizedMemo } from '@/hooks/useOptimizedMemo'

interface DashboardStats {
  totalTimeEntries: number
  totalBillableHours: number
  totalClients: number
  totalCases: number
  totalActiveCases: number
  pendingInvoices: number
  hoursThisWeek: number
  hoursThisMonth: number
  utilizationRate: number
  averageHoursPerDay: number
  totalRevenue: number
  pendingTasks: number
  overdueTasks: number
  loading?: boolean
  error?: string | null
}

export const useMemoizedMetrics = (stats: DashboardStats) => {
  // Memoización de transformaciones costosas
  const enhancedStats = useOptimizedMemo(() => {
    const totalHours = stats.totalBillableHours + (stats.totalTimeEntries * 0.3) // estimación horas no facturables
    const utilizationRate = totalHours > 0 ? 
      Math.round((stats.totalBillableHours / totalHours) * 100) : 0
    const estimatedRevenue = stats.totalBillableHours * 50 // €50/hora estimado
    
    return {
      ...stats,
      utilizationRate,
      totalRevenue: estimatedRevenue,
      efficiencyScore: utilizationRate > 75 ? 'high' : utilizationRate > 50 ? 'medium' : 'low',
      hoursPerDayAvg: stats.hoursThisMonth / 30,
      revenuePerClient: stats.totalClients > 0 ? estimatedRevenue / stats.totalClients : 0
    }
  }, [
    stats.totalTimeEntries,
    stats.totalBillableHours,
    stats.totalClients,
    stats.totalCases,
    stats.totalActiveCases,
    stats.hoursThisMonth
  ], 'enhanced-stats')

  // Memoización de métricas calculadas
  const calculatedMetrics = useOptimizedMemo(() => {
    return {
      caseLoad: enhancedStats.totalActiveCases / Math.max(enhancedStats.totalClients, 1),
      growthRate: enhancedStats.hoursThisMonth > 0 ? 
        ((enhancedStats.hoursThisWeek * 4) / enhancedStats.hoursThisMonth - 1) * 100 : 0,
      productivityIndex: (enhancedStats.utilizationRate + (enhancedStats.totalCases / 10)) / 2,
      alertsCount: enhancedStats.pendingTasks + enhancedStats.overdueTasks + enhancedStats.pendingInvoices
    }
  }, [enhancedStats], 'calculated-metrics')

  // Formatters memoizados
  const formatters = useMemo(() => ({
    currency: (amount: number) => 
      new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount),
    hours: (hours: number) => 
      `${hours.toFixed(1)}h`,
    percentage: (value: number) => 
      `${Math.round(value)}%`,
    number: (value: number) => 
      value.toLocaleString('es-ES')
  }), [])

  return {
    enhancedStats,
    calculatedMetrics,
    formatters,
    isLoading: stats.loading,
    hasError: !!stats.error
  }
}
