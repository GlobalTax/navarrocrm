import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface EmailMetrics {
  totalEmails: number
  unreadCount: number
  sentToday: number
  receivedToday: number
  draftsCount: number
  threadsCount: number
  averageResponseTime: number
  topSenders: Array<{
    email: string
    count: number
  }>
}

export function useEmailMetrics() {
  const { user } = useApp()

  const { data: metrics, isLoading, error, refetch } = useQuery({
    queryKey: ['email-metrics', user?.org_id],
    queryFn: async (): Promise<EmailMetrics> => {
      if (!user?.org_id) {
        return {
          totalEmails: 0,
          unreadCount: 0,
          sentToday: 0,
          receivedToday: 0,
          draftsCount: 0,
          threadsCount: 0,
          averageResponseTime: 0,
          topSenders: []
        }
      }

      try {
        const today = new Date().toISOString().split('T')[0]

        // Obtener métricas básicas de forma segura
        const { count: totalEmails = 0 } = await supabase
          .from('email_messages')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', user.org_id) || { count: 0 }

        const { count: unreadCount = 0 } = await supabase
          .from('email_messages')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', user.org_id)
          .eq('is_read', false) || { count: 0 }

        return {
          totalEmails: totalEmails || 0,
          unreadCount: unreadCount || 0,
          sentToday: 0,
          receivedToday: 0,
          draftsCount: 0,
          threadsCount: 0,
          averageResponseTime: 0,
          topSenders: []
        }
      } catch (error) {
        console.error('Error fetching email metrics:', error)
        return {
          totalEmails: 0,
          unreadCount: 0,
          sentToday: 0,
          receivedToday: 0,
          draftsCount: 0,
          threadsCount: 0,
          averageResponseTime: 0,
          topSenders: []
        }
      }
    },
    enabled: !!user?.org_id,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
    retry: 1
  })

  return {
    metrics,
    isLoading,
    error,
    refetch
  }
}