import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useSubscriptionNotifications } from './useSubscriptionNotifications'
import { useOutgoingSubscriptionNotifications } from './useOutgoingSubscriptions'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'subscription_expiring'
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  actionUrl?: string
  actionLabel?: string
}

export const useNotifications = () => {
  const { user } = useApp()
  const { data: subscriptionNotifications = [] } = useSubscriptionNotifications()
  const { data: outgoingSubscriptionNotifications = [] } = useOutgoingSubscriptionNotifications()

  return useQuery({
    queryKey: ['notifications', user?.org_id],
    queryFn: async (): Promise<{
      notifications: Notification[]
      unreadCount: number
    }> => {
      if (!user?.org_id) {
        return { notifications: [], unreadCount: 0 }
      }

      // Obtener notificaciones de AI
      const { data: aiNotifications = [] } = await supabase
        .from('ai_alert_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      // Obtener tareas próximas a vencer
      const { data: tasks = [] } = await supabase
        .from('tasks')
        .select('id, title, due_date, priority')
        .eq('org_id', user.org_id)
        .in('status', ['pending', 'in_progress'])
        .gte('due_date', new Date().toISOString().split('T')[0])
        .lte('due_date', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('due_date', { ascending: true })
        .limit(5)

      // Convertir a formato de notificación
      const aiNotificationItems: Notification[] = aiNotifications.map(notif => ({
        id: `ai-${notif.id}`,
        type: notif.severity === 'high' ? 'error' : notif.severity === 'medium' ? 'warning' : 'info',
        title: `Alerta AI: ${notif.alert_type}`,
        message: notif.message,
        isRead: notif.is_read,
        createdAt: new Date(notif.created_at),
        actionUrl: '/settings/ai',
        actionLabel: 'Ver Configuración IA'
      }))

      const taskNotifications: Notification[] = tasks.map(task => ({
        id: `task-${task.id}`,
        type: task.priority === 'urgent' ? 'error' : 'warning',
        title: 'Tarea próxima a vencer',
        message: `${task.title} - Vence: ${new Date(task.due_date).toLocaleDateString()}`,
        isRead: false,
        createdAt: new Date(task.due_date),
        actionUrl: '/tasks',
        actionLabel: 'Ver Tareas'
      }))

      // Convertir notificaciones de suscripciones
      const subscriptionNotificationItems: Notification[] = subscriptionNotifications.map(sub => ({
        id: sub.id,
        type: 'subscription_expiring' as const,
        title: 'Pago próximo',
        message: `${sub.contactName} - ${sub.planName} vence en ${sub.daysUntilDue} días`,
        isRead: false,
        createdAt: new Date(sub.nextPaymentDue),
        actionUrl: '/subscriptions',
        actionLabel: 'Ver Suscripciones'
      }))

      // Convertir notificaciones de suscripciones externas
      const outgoingSubscriptionNotificationItems: Notification[] = outgoingSubscriptionNotifications.map(sub => ({
        id: sub.id,
        type: 'warning' as const,
        title: 'Renovación externa próxima',
        message: `${sub.providerName} - Renovación en ${sub.daysUntilRenewal} días (${sub.amount}${sub.currency})`,
        isRead: false,
        createdAt: new Date(sub.nextRenewalDate),
        actionUrl: '/outgoing-subscriptions',
        actionLabel: 'Ver Suscripciones'
      }))

      const allNotifications = [
        ...aiNotificationItems,
        ...taskNotifications,
        ...subscriptionNotificationItems,
        ...outgoingSubscriptionNotificationItems
      ]

      const unreadCount = allNotifications.filter(n => !n.isRead).length

      return {
        notifications: allNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        unreadCount
      }
    },
    enabled: !!user?.org_id,
    refetchInterval: 30000 // Refrescar cada 30 segundos
  })
}

export const useNotificationActions = () => {
  const { user } = useApp()

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return

    // Si es una notificación de AI, marcar como leída
    if (notificationId.startsWith('ai-')) {
      const aiNotifId = notificationId.replace('ai-', '')
      await supabase
        .from('ai_alert_notifications')
        .update({ is_read: true })
        .eq('id', aiNotifId)
        .eq('user_id', user.id)
    }
    // Las notificaciones de tareas y suscripciones se consideran de solo lectura
  }

  const markAllAsRead = async () => {
    if (!user?.id) return

    await supabase
      .from('ai_alert_notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
  }

  return {
    markAsRead,
    markAllAsRead
  }
}