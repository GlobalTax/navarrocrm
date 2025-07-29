import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { addDays, parseISO, isAfter } from 'date-fns'
import type { OutgoingSubscription, CreateOutgoingSubscriptionData, OutgoingSubscriptionStats } from '@/types/outgoing-subscriptions'

export const useOutgoingSubscriptions = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  // Obtener todas las suscripciones externas
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['outgoing-subscriptions', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []

      const { data, error } = await supabase
        .from('outgoing_subscriptions')
        .select('*')
        .eq('org_id', user.org_id)
        .order('next_renewal_date', { ascending: true })

      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id
  })

  // Crear suscripción externa
  const createSubscription = useMutation({
    mutationFn: async (data: CreateOutgoingSubscriptionData) => {
      if (!user?.org_id || !user?.id) throw new Error('Usuario no autenticado')

      const subscriptionData = {
        ...data,
        org_id: user.org_id,
        currency: data.currency || 'EUR'
      }

      const { data: subscription, error } = await supabase
        .from('outgoing_subscriptions')
        .insert(subscriptionData)
        .select()
        .single()

      if (error) throw error
      return subscription
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outgoing-subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['outgoing-subscription-stats'] })
      toast.success('Suscripción externa creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating outgoing subscription:', error)
      toast.error('Error al crear la suscripción externa')
    }
  })

  // Actualizar suscripción externa
  const updateSubscription = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OutgoingSubscription> }) => {
      const { error } = await supabase
        .from('outgoing_subscriptions')
        .update(data)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outgoing-subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['outgoing-subscription-stats'] })
      toast.success('Suscripción externa actualizada exitosamente')
    },
    onError: (error) => {
      console.error('Error updating outgoing subscription:', error)
      toast.error('Error al actualizar la suscripción externa')
    }
  })

  // Cancelar suscripción externa
  const cancelSubscription = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const { error } = await supabase
        .from('outgoing_subscriptions')
        .update({ 
          status: 'CANCELLED'
        })
        .eq('id', subscriptionId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outgoing-subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['outgoing-subscription-stats'] })
      toast.success('Suscripción externa cancelada exitosamente')
    },
    onError: (error) => {
      console.error('Error canceling outgoing subscription:', error)
      toast.error('Error al cancelar la suscripción externa')
    }
  })

  // Eliminar suscripción externa
  const deleteSubscription = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const { error } = await supabase
        .from('outgoing_subscriptions')
        .delete()
        .eq('id', subscriptionId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outgoing-subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['outgoing-subscription-stats'] })
      toast.success('Suscripción externa eliminada exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting outgoing subscription:', error)
      toast.error('Error al eliminar la suscripción externa')
    }
  })

  return {
    subscriptions,
    isLoading,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    deleteSubscription,
    isCreating: createSubscription.isPending,
    isUpdating: updateSubscription.isPending,
    isCanceling: cancelSubscription.isPending,
    isDeleting: deleteSubscription.isPending
  }
}

// Hook para estadísticas de suscripciones externas
export const useOutgoingSubscriptionStats = () => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['outgoing-subscription-stats', user?.org_id],
    queryFn: async (): Promise<OutgoingSubscriptionStats> => {
      if (!user?.org_id) {
        return {
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          monthlyTotal: 0,
          yearlyTotal: 0,
          averageMonthlyAmount: 0,
          upcomingRenewals: 0
        }
      }

      const { data: subscriptions, error } = await supabase
        .from('outgoing_subscriptions')
        .select('status, amount, billing_cycle, next_renewal_date, quantity')
        .eq('org_id', user.org_id)

      if (error) throw error

      const totalSubscriptions = subscriptions.length
      const activeSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE').length
      
      // Calcular gastos mensuales y anuales considerando cantidad
      const monthlyTotal = subscriptions
        .filter(s => s.status === 'ACTIVE')
        .reduce((sum, s) => {
          const quantity = s.quantity || 1
          let monthlyAmount = s.amount * quantity
          if (s.billing_cycle === 'YEARLY') monthlyAmount = (s.amount * quantity) / 12
          return sum + monthlyAmount
        }, 0)

      const yearlyTotal = monthlyTotal * 12

      const averageMonthlyAmount = activeSubscriptions > 0 
        ? monthlyTotal / activeSubscriptions 
        : 0

      // Calcular renovaciones próximas (próximos 30 días)
      const thirtyDaysFromNow = addDays(new Date(), 30)
      const upcomingRenewals = subscriptions.filter(s => 
        s.status === 'ACTIVE' && 
        s.next_renewal_date &&
        isAfter(parseISO(s.next_renewal_date), new Date()) &&
        !isAfter(parseISO(s.next_renewal_date), thirtyDaysFromNow)
      ).length

      return {
        totalSubscriptions,
        activeSubscriptions,
        monthlyTotal,
        yearlyTotal,
        averageMonthlyAmount,
        upcomingRenewals
      }
    },
    enabled: !!user?.org_id
  })
}

// Hook para notificaciones de renovación
export const useOutgoingSubscriptionNotifications = () => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['outgoing-subscription-notifications', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []

      // Próximas renovaciones en 7 días
      const sevenDaysFromNow = addDays(new Date(), 7)
      const today = new Date()

      const { data: subscriptions, error } = await supabase
        .from('outgoing_subscriptions')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('status', 'ACTIVE')
        .not('next_renewal_date', 'is', null)

      if (error) {
        console.error('Error fetching outgoing subscription notifications:', error)
        return []
      }

      if (!subscriptions) return []

      // Filtrar suscripciones que se renuevan en los próximos 7 días
      const notifications = subscriptions
        .filter(sub => {
          const renewalDate = parseISO(sub.next_renewal_date)
          return isAfter(renewalDate, today) && !isAfter(renewalDate, sevenDaysFromNow)
        })
        .map(sub => {
          const renewalDate = parseISO(sub.next_renewal_date)
          const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          
          return {
            id: `outgoing-subscription-${sub.id}`,
            subscriptionId: sub.id,
            providerName: sub.provider_name,
            amount: sub.amount,
            currency: sub.currency,
            daysUntilRenewal,
            nextRenewalDate: sub.next_renewal_date,
            type: 'outgoing_subscription_renewal' as const
          }
        })
        .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal)

      return notifications
    },
    enabled: !!user?.org_id,
    refetchInterval: 5 * 60 * 1000, // Refrescar cada 5 minutos
    staleTime: 2 * 60 * 1000 // Considerar datos obsoletos después de 2 minutos
  })
}