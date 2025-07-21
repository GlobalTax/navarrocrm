
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { useMemo } from 'react'

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
    queryFn: async () => {
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

      return logs || []
    },
    enabled: true,
    staleTime: 1000 * 60 * 2, // 2 minutos para datos de uso de AI (relativamente frescos)
    placeholderData: (previousData) => previousData ?? [],
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
    },
    staleTime: 1000 * 60 * 10, // 10 minutos para roles
    select: (data) => data.map(role => ({
      id: role.id,
      user_id: role.user_id,
      role: role.role
    })),
    placeholderData: (previousData) => previousData ?? [],
  })
}

export const useIsSuperAdmin = () => {
  const { data: roles, isLoading } = useUserRoles()
  
  return {
    isSuperAdmin: roles?.some(role => role.role === 'super_admin') || false,
    isLoading
  }
}
