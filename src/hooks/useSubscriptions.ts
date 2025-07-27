import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { Subscription, CreateSubscriptionData, SubscriptionStats } from '@/types/subscriptions'

export const useSubscriptions = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  // Obtener todas las suscripciones
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(item => ({
        ...item,
        status: item.status as 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'PAUSED',
        billing_frequency: item.billing_frequency as 'monthly' | 'quarterly' | 'yearly'
      }))
    },
    enabled: !!user?.org_id
  })

  // Crear suscripción
  const createSubscription = useMutation({
    mutationFn: async (data: CreateSubscriptionData) => {
      if (!user?.org_id || !user?.id) throw new Error('Usuario no autenticado')

      // Calcular próxima fecha de pago
      const startDate = new Date(data.start_date)
      const nextPaymentDue = new Date(startDate)
      
      switch (data.billing_frequency) {
        case 'monthly':
          nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1)
          break
        case 'quarterly':
          nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 3)
          break
        case 'yearly':
          nextPaymentDue.setFullYear(nextPaymentDue.getFullYear() + 1)
          break
      }

      const subscriptionData = {
        ...data,
        org_id: user.org_id,
        created_by: user.id,
        next_payment_due: nextPaymentDue.toISOString().split('T')[0],
        status: 'ACTIVE' as const
      }

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single()

      if (error) throw error
      return subscription
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] })
      toast.success('Suscripción creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating subscription:', error)
      toast.error('Error al crear la suscripción')
    }
  })

  // Actualizar suscripción
  const updateSubscription = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Subscription> }) => {
      const { error } = await supabase
        .from('subscriptions')
        .update(data)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] })
      toast.success('Suscripción actualizada exitosamente')
    },
    onError: (error) => {
      console.error('Error updating subscription:', error)
      toast.error('Error al actualizar la suscripción')
    }
  })

  // Cancelar suscripción
  const cancelSubscription = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'CANCELED',
          auto_renew: false,
          end_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', subscriptionId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] })
      toast.success('Suscripción cancelada exitosamente')
    },
    onError: (error) => {
      console.error('Error canceling subscription:', error)
      toast.error('Error al cancelar la suscripción')
    }
  })

  // Eliminar suscripción
  const deleteSubscription = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subscriptionId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] })
      toast.success('Suscripción eliminada exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting subscription:', error)
      toast.error('Error al eliminar la suscripción')
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

// Hook para estadísticas de suscripciones
export const useSubscriptionStats = () => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['subscription-stats', user?.org_id],
    queryFn: async (): Promise<SubscriptionStats> => {
      if (!user?.org_id) {
        return {
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          monthlyRevenue: 0,
          churnRate: 0,
          averageSubscriptionValue: 0
        }
      }

      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('status, price, billing_frequency, created_at')
        .eq('org_id', user.org_id)

      if (error) throw error

      const totalSubscriptions = subscriptions.length
      const activeSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE').length
      
      // Calcular ingresos mensuales (convertir todos a base mensual)
      const monthlyRevenue = subscriptions
        .filter(s => s.status === 'ACTIVE')
        .reduce((sum, s) => {
          let monthlyPrice = s.price
          if (s.billing_frequency === 'quarterly') monthlyPrice = s.price / 3
          if (s.billing_frequency === 'yearly') monthlyPrice = s.price / 12
          return sum + monthlyPrice
        }, 0)

      const averageSubscriptionValue = activeSubscriptions > 0 
        ? monthlyRevenue / activeSubscriptions 
        : 0

      // Calcular tasa de churn (muy básico - canceladas en los últimos 30 días)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentCancellations = subscriptions.filter(s => 
        s.status === 'CANCELED' && 
        new Date(s.created_at) >= thirtyDaysAgo
      ).length

      const churnRate = totalSubscriptions > 0 
        ? (recentCancellations / totalSubscriptions) * 100 
        : 0

      return {
        totalSubscriptions,
        activeSubscriptions,
        monthlyRevenue,
        churnRate,
        averageSubscriptionValue
      }
    },
    enabled: !!user?.org_id
  })
}