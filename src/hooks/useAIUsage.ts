
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export interface AIUsageLog {
  id: string
  org_id: string
  user_id: string
  function_name: string
  prompt_tokens: number | null
  completion_tokens: number | null
  total_tokens: number | null
  estimated_cost: number | null
  duration_ms: number | null
  model_used: string | null
  success: boolean | null
  error_message: string | null
  created_at: string
}

export interface AIUsageStats {
  totalCalls: number
  totalTokens: number
  totalCost: number
  successRate: number
  avgDuration: number
  callsByOrg: Record<string, number>
  tokensByOrg: Record<string, number>
  costByOrg: Record<string, number>
}

export const useAIUsage = (month?: Date) => {
  const startDate = month ? startOfMonth(month) : startOfMonth(new Date())
  const endDate = month ? endOfMonth(month) : endOfMonth(new Date())

  return useQuery({
    queryKey: ['ai-usage', format(startDate, 'yyyy-MM')],
    queryFn: async (): Promise<{ logs: AIUsageLog[], stats: AIUsageStats }> => {
      const { data: logs, error } = await supabase
        .from('ai_usage_logs')
        .select(`
          *,
          organizations!inner(name)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Error fetching AI usage: ${error.message}`)
      }

      // Calcular estadísticas
      const stats: AIUsageStats = {
        totalCalls: logs?.length || 0,
        totalTokens: logs?.reduce((sum, log) => sum + (log.total_tokens || 0), 0) || 0,
        totalCost: logs?.reduce((sum, log) => sum + (log.estimated_cost || 0), 0) || 0,
        successRate: logs?.length ? (logs.filter(log => log.success).length / logs.length) * 100 : 0,
        avgDuration: logs?.length ? (logs.reduce((sum, log) => sum + (log.duration_ms || 0), 0) / logs.length) : 0,
        callsByOrg: {},
        tokensByOrg: {},
        costByOrg: {}
      }

      // Agrupar por organización
      logs?.forEach(log => {
        const orgName = (log as any).organizations?.name || 'Sin organización'
        stats.callsByOrg[orgName] = (stats.callsByOrg[orgName] || 0) + 1
        stats.tokensByOrg[orgName] = (stats.tokensByOrg[orgName] || 0) + (log.total_tokens || 0)
        stats.costByOrg[orgName] = (stats.costByOrg[orgName] || 0) + (log.estimated_cost || 0)
      })

      return { logs: logs || [], stats }
    },
    enabled: true
  })
}

export const useUserRoles = () => {
  return useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)

      if (error) {
        throw new Error(`Error fetching user roles: ${error.message}`)
      }

      return data || []
    }
  })
}

export const useIsSuperAdmin = () => {
  const { data: roles, isLoading } = useUserRoles()
  
  return {
    isSuperAdmin: roles?.some(role => role.role === 'super_admin') || false,
    isLoading
  }
}
