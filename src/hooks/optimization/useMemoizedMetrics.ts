
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

// Función helper para normalizar valores numéricos
const safeNumber = (value: any): number => {
  const num = Number(value)
  return isNaN(num) || !isFinite(num) ? 0 : num
}

// Función helper para normalizar stats
const normalizeDashboardStats = (stats: Partial<DashboardStats>): DashboardStats => {
  return {
    totalTimeEntries: safeNumber(stats.totalTimeEntries),
    totalBillableHours: safeNumber(stats.totalBillableHours),
    totalClients: safeNumber(stats.totalClients),
    totalCases: safeNumber(stats.totalCases),
    totalActiveCases: safeNumber(stats.totalActiveCases),
    pendingInvoices: safeNumber(stats.pendingInvoices),
    hoursThisWeek: safeNumber(stats.hoursThisWeek),
    hoursThisMonth: safeNumber(stats.hoursThisMonth),
    utilizationRate: safeNumber(stats.utilizationRate),
    averageHoursPerDay: safeNumber(stats.averageHoursPerDay),
    totalRevenue: safeNumber(stats.totalRevenue),
    pendingTasks: safeNumber(stats.pendingTasks),
    overdueTasks: safeNumber(stats.overdueTasks),
    loading: stats.loading || false,
    error: stats.error || null
  }
}

export const useMemoizedMetrics = (stats: Partial<DashboardStats>) => {
  // Normalizar stats de entrada para evitar errores
  const normalizedStats = useMemo(() => normalizeDashboardStats(stats), [stats])

  // Memoización de transformaciones costosas
  const enhancedStats = useOptimizedMemo(() => {
    const totalHours = normalizedStats.totalBillableHours + (normalizedStats.totalTimeEntries * 0.3) // estimación horas no facturables
    const utilizationRate = totalHours > 0 ? 
      Math.round((normalizedStats.totalBillableHours / totalHours) * 100) : 0
    const estimatedRevenue = normalizedStats.totalBillableHours * 50 // €50/hora estimado
    
    return {
      ...normalizedStats,
      utilizationRate: Math.max(0, Math.min(100, utilizationRate)), // Clamp entre 0-100
      totalRevenue: Math.max(0, estimatedRevenue), // Asegurar no negativo
      efficiencyScore: utilizationRate > 75 ? 'high' : utilizationRate > 50 ? 'medium' : 'low',
      hoursPerDayAvg: normalizedStats.hoursThisMonth / 30,
      revenuePerClient: normalizedStats.totalClients > 0 ? estimatedRevenue / normalizedStats.totalClients : 0
    }
  }, [
    normalizedStats.totalTimeEntries,
    normalizedStats.totalBillableHours,
    normalizedStats.totalClients,
    normalizedStats.totalCases,
    normalizedStats.totalActiveCases,
    normalizedStats.hoursThisMonth
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
    currency: (amount: number | undefined | null) => {
      const validAmount = safeNumber(amount)
      return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(validAmount)
    },
    hours: (hours: number | undefined | null) => {
      const validHours = safeNumber(hours)
      return `${validHours.toFixed(1)}h`
    },
    percentage: (value: number | undefined | null) => {
      const validValue = safeNumber(value)
      return `${Math.round(validValue)}%`
    },
    number: (value: number | undefined | null) => {
      const validValue = safeNumber(value)
      return validValue.toLocaleString('es-ES')
    }
  }), [])

  return {
    enhancedStats,
    calculatedMetrics,
    formatters,
    isLoading: normalizedStats.loading,
    hasError: !!normalizedStats.error
  }
}
