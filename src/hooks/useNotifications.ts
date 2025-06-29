
import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/contexts/AppContext'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  actionUrl?: string
  actionLabel?: string
}

export const useNotifications = () => {
  const { user } = useApp()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Generar notificaciones de ejemplo basadas en la actividad del usuario
  const generateMockNotifications = useCallback((): Notification[] => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    return [
      {
        id: '1',
        type: 'warning',
        title: 'Tareas Pendientes',
        message: 'Tienes 3 tareas que vencen hoy',
        isRead: false,
        createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 min ago
        actionUrl: '/tasks',
        actionLabel: 'Ver Tareas'
      },
      {
        id: '2',
        type: 'info',
        title: 'Nueva Propuesta',
        message: 'Se ha enviado una propuesta a Cliente ABC S.L.',
        isRead: false,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        actionUrl: '/proposals',
        actionLabel: 'Ver Propuestas'
      },
      {
        id: '3',
        type: 'success',
        title: 'Pago Recibido',
        message: 'Pago de €2,500 confirmado para el expediente EXP-2024-0123',
        isRead: false,
        createdAt: yesterday,
        actionUrl: '/cases',
        actionLabel: 'Ver Expediente'
      },
      {
        id: '4',
        type: 'error',
        title: 'Expediente Retrasado',
        message: 'El expediente EXP-2024-0118 lleva 5 días sin actividad',
        isRead: true,
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        actionUrl: '/cases',
        actionLabel: 'Ver Expediente'
      },
      {
        id: '5',
        type: 'info',
        title: 'Recordatorio de Reunión',
        message: 'Tienes una reunión con Cliente XYZ en 1 hora',
        isRead: true,
        createdAt: lastWeek,
        actionUrl: '/calendar',
        actionLabel: 'Ver Calendario'
      }
    ]
  }, [])

  const loadNotifications = useCallback(async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Simular carga de notificaciones
      await new Promise(resolve => setTimeout(resolve, 500))
      const mockNotifications = generateMockNotifications()
      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, generateMockNotifications])

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }, [])

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    )
  }, [])

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Simulación de nuevas notificaciones cada 2 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance de nueva notificación
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: 'info',
          title: 'Nueva Actividad',
          message: 'Se ha registrado nueva actividad en tu cuenta',
          isRead: false,
          createdAt: new Date(),
          actionUrl: '/dashboard'
        }
        setNotifications(prev => [newNotification, ...prev])
      }
    }, 2 * 60 * 1000) // 2 minutos

    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length
  const recentNotifications = notifications.slice(0, 10) // Mostrar solo las 10 más recientes

  return {
    notifications: recentNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    loadNotifications
  }
}
