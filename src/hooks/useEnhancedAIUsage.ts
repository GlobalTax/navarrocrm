
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns'
import { AIUsageLog, AIUsageStats } from './useAIUsage'

export interface EnhancedAIUsageStats extends AIUsageStats {
  monthlyTrends: Array<{
    month: string
    calls: number
    tokens: number
    cost: number
    successRate: number
  }>
  topUsers: Array<{
    userId: string
    userEmail: string
    calls: number
    tokens: number
    cost: number
  }>
  modelPerformance: Array<{
    model: string
    calls: number
    avgDuration: number
    successRate: number
    cost: number
  }>
  anomalies: Array<{
    type: 'high_cost' | 'high_failures' | 'unusual_pattern'
    message: string
    severity: 'low' | 'medium' | 'high'
    timestamp: string
  }>
}

export const useEnhancedAIUsage = (months: number = 6) => {
  return useQuery({
    queryKey: ['enhanced-ai-usage', months],
    queryFn: async (): Promise<EnhancedAIUsageStats> => {
      const endDate = new Date()
      const startDate = subMonths(endDate, months)

      // Obtener logs con información de usuarios
      const { data: logs, error } = await supabase
        .from('ai_usage_logs')
        .select(`
          *,
          organizations!inner(name),
          users!inner(email)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Error fetching enhanced AI usage: ${error.message}`)
      }

      const typedLogs = (logs || []) as (AIUsageLog & { 
        organizations: { name: string }
        users: { email: string }
      })[]

      // Calcular estadísticas básicas
      const basicStats = calculateBasicStats(typedLogs)
      
      // Calcular tendencias mensuales
      const monthlyTrends = calculateMonthlyTrends(typedLogs, months)
      
      // Top usuarios
      const topUsers = calculateTopUsers(typedLogs)
      
      // Rendimiento por modelo
      const modelPerformance = calculateModelPerformance(typedLogs)
      
      // Detectar anomalías
      const anomalies = detectAnomalies(typedLogs, monthlyTrends)

      return {
        ...basicStats,
        monthlyTrends,
        topUsers,
        modelPerformance,
        anomalies
      }
    },
    enabled: true,
    refetchInterval: 5 * 60 * 1000 // 5 minutos
  })
}

function calculateBasicStats(logs: any[]): AIUsageStats {
  const totalCalls = logs.length
  const totalTokens = logs.reduce((sum, log) => sum + (log.total_tokens || 0), 0)
  const totalCost = logs.reduce((sum, log) => sum + (log.estimated_cost || 0), 0)
  const successfulCalls = logs.filter(log => log.success).length
  const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0
  const avgDuration = logs.length > 0 ? logs.reduce((sum, log) => sum + (log.duration_ms || 0), 0) / logs.length : 0

  const callsByOrg: Record<string, number> = {}
  const tokensByOrg: Record<string, number> = {}
  const costByOrg: Record<string, number> = {}

  logs.forEach(log => {
    const orgName = log.organizations?.name || 'Sin organización'
    callsByOrg[orgName] = (callsByOrg[orgName] || 0) + 1
    tokensByOrg[orgName] = (tokensByOrg[orgName] || 0) + (log.total_tokens || 0)
    costByOrg[orgName] = (costByOrg[orgName] || 0) + (log.estimated_cost || 0)
  })

  return {
    totalCalls,
    totalTokens,
    totalCost,
    successRate,
    avgDuration,
    callsByOrg,
    tokensByOrg,
    costByOrg
  }
}

function calculateMonthlyTrends(logs: any[], months: number) {
  const trends = []
  
  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)
    
    const monthLogs = logs.filter(log => {
      const logDate = new Date(log.created_at)
      return logDate >= monthStart && logDate <= monthEnd
    })
    
    const calls = monthLogs.length
    const tokens = monthLogs.reduce((sum, log) => sum + (log.total_tokens || 0), 0)
    const cost = monthLogs.reduce((sum, log) => sum + (log.estimated_cost || 0), 0)
    const successfulCalls = monthLogs.filter(log => log.success).length
    const successRate = calls > 0 ? (successfulCalls / calls) * 100 : 0
    
    trends.push({
      month: format(date, 'MMM yyyy'),
      calls,
      tokens,
      cost,
      successRate
    })
  }
  
  return trends
}

function calculateTopUsers(logs: any[]) {
  const userStats: Record<string, any> = {}
  
  logs.forEach(log => {
    const userId = log.user_id
    const userEmail = log.users?.email || 'Usuario desconocido'
    
    if (!userStats[userId]) {
      userStats[userId] = {
        userId,
        userEmail,
        calls: 0,
        tokens: 0,
        cost: 0
      }
    }
    
    userStats[userId].calls++
    userStats[userId].tokens += log.total_tokens || 0
    userStats[userId].cost += log.estimated_cost || 0
  })
  
  return Object.values(userStats)
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 10)
}

function calculateModelPerformance(logs: any[]) {
  const modelStats: Record<string, any> = {}
  
  logs.forEach(log => {
    const model = log.model_used || 'unknown'
    
    if (!modelStats[model]) {
      modelStats[model] = {
        model,
        calls: 0,
        totalDuration: 0,
        successfulCalls: 0,
        cost: 0
      }
    }
    
    modelStats[model].calls++
    modelStats[model].totalDuration += log.duration_ms || 0
    modelStats[model].cost += log.estimated_cost || 0
    
    if (log.success) {
      modelStats[model].successfulCalls++
    }
  })
  
  return Object.values(modelStats).map((stats: any) => ({
    model: stats.model,
    calls: stats.calls,
    avgDuration: stats.calls > 0 ? stats.totalDuration / stats.calls : 0,
    successRate: stats.calls > 0 ? (stats.successfulCalls / stats.calls) * 100 : 0,
    cost: stats.cost
  }))
}

function detectAnomalies(logs: any[], trends: any[]) {
  const anomalies = []
  
  // Detectar picos de costo
  const avgCost = trends.reduce((sum, t) => sum + t.cost, 0) / trends.length
  const lastMonthCost = trends[trends.length - 1]?.cost || 0
  
  if (lastMonthCost > avgCost * 1.5) {
    anomalies.push({
      type: 'high_cost' as const,
      message: `Costo del último mes ${lastMonthCost.toFixed(2)}€ es 50% mayor al promedio`,
      severity: 'high' as const,
      timestamp: new Date().toISOString()
    })
  }
  
  // Detectar alta tasa de fallos
  const recentLogs = logs.slice(0, 100) // Últimos 100 registros
  const recentFailureRate = recentLogs.filter(log => !log.success).length / recentLogs.length * 100
  
  if (recentFailureRate > 20) {
    anomalies.push({
      type: 'high_failures' as const,
      message: `Tasa de fallos reciente del ${recentFailureRate.toFixed(1)}% es muy alta`,
      severity: 'high' as const,
      timestamp: new Date().toISOString()
    })
  }
  
  // Detectar patrones inusuales de uso
  const todayLogs = logs.filter(log => {
    const logDate = new Date(log.created_at)
    const today = new Date()
    return logDate.toDateString() === today.toDateString()
  })
  
  if (todayLogs.length > 1000) {
    anomalies.push({
      type: 'unusual_pattern' as const,
      message: `Uso inusualmente alto hoy: ${todayLogs.length} llamadas`,
      severity: 'medium' as const,
      timestamp: new Date().toISOString()
    })
  }
  
  return anomalies
}
