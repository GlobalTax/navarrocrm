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
      if (!user?.org_id) throw new Error('Usuario no autenticado')

      const today = new Date().toISOString().split('T')[0]

      // Obtener métricas generales de emails
      const [
        { count: totalEmails },
        { count: unreadCount },
        { count: sentToday },
        { count: receivedToday },
        { count: draftsCount },
        { count: threadsCount }
      ] = await Promise.all([
        supabase.from('email_messages').select('*', { count: 'exact', head: true }).eq('org_id', user.org_id),
        supabase.from('email_messages').select('*', { count: 'exact', head: true }).eq('org_id', user.org_id).eq('is_read', false),
        supabase.from('email_messages').select('*', { count: 'exact', head: true }).eq('org_id', user.org_id).eq('message_type', 'sent').gte('sent_datetime', today),
        supabase.from('email_messages').select('*', { count: 'exact', head: true }).eq('org_id', user.org_id).eq('message_type', 'received').gte('received_datetime', today),
        supabase.from('email_messages').select('*', { count: 'exact', head: true }).eq('org_id', user.org_id).eq('message_type', 'draft'),
        supabase.from('email_threads').select('*', { count: 'exact', head: true }).eq('org_id', user.org_id)
      ])

      // Obtener top senders
      const { data: topSenders } = await supabase
        .from('email_messages')
        .select('from_address')
        .eq('org_id', user.org_id)
        .gte('received_datetime', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .not('from_address', 'is', null)

      // Agrupar senders
      const senderCounts = topSenders?.reduce((acc: Record<string, number>, msg) => {
        if (msg.from_address) {
          acc[msg.from_address] = (acc[msg.from_address] || 0) + 1
        }
        return acc
      }, {}) || {}

      const topSendersArray = Object.entries(senderCounts)
        .map(([email, count]) => ({ email, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return {
        totalEmails: totalEmails || 0,
        unreadCount: unreadCount || 0,
        sentToday: sentToday || 0,
        receivedToday: receivedToday || 0,
        draftsCount: draftsCount || 0,
        threadsCount: threadsCount || 0,
        averageResponseTime: 0, // TODO: Calcular tiempo promedio de respuesta
        topSenders: topSendersArray
      }
    },
    enabled: !!user?.org_id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchInterval: 1000 * 60 * 10 // 10 minutos
  })

  return {
    metrics,
    isLoading,
    error,
    refetch
  }
}