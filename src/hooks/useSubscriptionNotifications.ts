import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { addDays, parseISO, isAfter } from 'date-fns'

export interface SubscriptionNotification {
  id: string
  contactId: string
  contactName: string
  subscriptionId: string
  planName: string
  nextPaymentDue: string
  daysUntilDue: number
  status: 'ACTIVE' | 'PAUSED'
  price: number
  type: 'subscription_expiring'
}

export const useSubscriptionNotifications = () => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['subscription-notifications', user?.org_id],
    queryFn: async (): Promise<SubscriptionNotification[]> => {
      if (!user?.org_id) return []

      // Calcular fecha límite (5 días desde hoy)
      const fiveDaysFromNow = addDays(new Date(), 5)
      const today = new Date()

      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          contact_id,
          plan_name,
          next_payment_due,
          status,
          price,
          contacts (
            id,
            name
          )
        `)
        .eq('org_id', user.org_id)
        .in('status', ['ACTIVE', 'PAUSED'])
        .not('next_payment_due', 'is', null)

      if (error) {
        console.error('Error fetching subscription notifications:', error)
        return []
      }

      if (!subscriptions) return []

      // Filtrar suscripciones que vencen en los próximos 5 días
      const notifications: SubscriptionNotification[] = subscriptions
        .filter(sub => {
          const paymentDue = parseISO(sub.next_payment_due)
          return isAfter(paymentDue, today) && !isAfter(paymentDue, fiveDaysFromNow)
        })
        .map(sub => {
          const paymentDue = parseISO(sub.next_payment_due)
          const daysUntilDue = Math.ceil((paymentDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          
          return {
            id: `subscription-${sub.id}`,
            contactId: sub.contact_id,
            contactName: sub.contacts?.name || 'Cliente sin nombre',
            subscriptionId: sub.id,
            planName: sub.plan_name,
            nextPaymentDue: sub.next_payment_due,
            daysUntilDue,
            status: sub.status as 'ACTIVE' | 'PAUSED',
            price: sub.price,
            type: 'subscription_expiring' as const
          }
        })
        .sort((a, b) => a.daysUntilDue - b.daysUntilDue)

      return notifications
    },
    enabled: !!user?.org_id,
    refetchInterval: 5 * 60 * 1000, // Refrescar cada 5 minutos
    staleTime: 2 * 60 * 1000 // Considerar datos obsoletos después de 2 minutos
  })
}

export const useSubscriptionNotificationCount = () => {
  const { data: notifications = [] } = useSubscriptionNotifications()
  return notifications.length
}