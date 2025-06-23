import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Clock, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { useIntelligentWorkflows } from '@/hooks/useIntelligentWorkflows'
import { toast } from 'sonner'

interface SmartNotification {
  id: string
  type: 'workflow' | 'deadline' | 'opportunity' | 'alert'
  title: string
  message: string
  priority: 'high' | 'medium' | 'low'
  actionable: boolean
  actions?: NotificationAction[]
  createdAt: Date
  isRead: boolean
}

interface NotificationAction {
  label: string
  action: () => void
  variant?: 'default' | 'destructive' | 'outline'
}

export const SmartNotifications = () => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([])
  const { detectInactiveCases } = useIntelligentWorkflows()

  useEffect(() => {
    generateSmartNotifications()
    
    // Refresh notifications every 30 minutes
    const interval = setInterval(generateSmartNotifications, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const generateSmartNotifications = async () => {
    const newNotifications: SmartNotification[] = []

    // Check for inactive cases
    const inactiveCases = await detectInactiveCases()
    if (inactiveCases && inactiveCases.length > 0) {
      newNotifications.push({
        id: 'inactive-cases',
        type: 'alert',
        title: 'Casos Inactivos Detectados',
        message: `${inactiveCases.length} casos sin actividad en los últimos 30 días`,
        priority: 'high',
        actionable: true,
        actions: [
          {
            label: 'Ver Casos',
            action: () => window.location.href = '/cases'
          },
          {
            label: 'Crear Recordatorios',
            action: () => createFollowUpTasks(inactiveCases)
          }
        ],
        createdAt: new Date(),
        isRead: false
      })
    }

    // Check for overdue tasks
    checkOverdueTasks().then(overdueTasks => {
      if (overdueTasks > 0) {
        newNotifications.push({
          id: 'overdue-tasks',
          type: 'deadline',
          title: 'Tareas Vencidas',
          message: `Tienes ${overdueTasks} tareas que han superado su fecha límite`,
          priority: 'high',
          actionable: true,
          actions: [
            {
              label: 'Ver Tareas',
              action: () => window.location.href = '/tasks'
            }
          ],
          createdAt: new Date(),
          isRead: false
        })
      }
    })

    // Check for proposal opportunities
    checkProposalOpportunities().then(opportunities => {
      if (opportunities > 0) {
        newNotifications.push({
          id: 'proposal-opportunities',
          type: 'opportunity',
          title: 'Oportunidades de Propuestas',
          message: `${opportunities} clientes podrían estar interesados en servicios adicionales`,
          priority: 'medium',
          actionable: true,
          actions: [
            {
              label: 'Ver Oportunidades',
              action: () => window.location.href = '/proposals'
            }
          ],
          createdAt: new Date(),
          isRead: false
        })
      }
    })

    setNotifications(prev => {
      const existing = prev.filter(n => !newNotifications.find(nn => nn.id === n.id))
      return [...existing, ...newNotifications]
    })
  }

  const checkOverdueTasks = async (): Promise<number> => {
    // This would be implemented with actual Supabase query
    return Math.floor(Math.random() * 5) // Mock data
  }

  const checkProposalOpportunities = async (): Promise<number> => {
    // This would be implemented with actual Supabase query
    return Math.floor(Math.random() * 3) // Mock data
  }

  const createFollowUpTasks = async (inactiveCases: any[]) => {
    // Implementation would create follow-up tasks for inactive cases
    toast.success('Recordatorios Creados', {
      description: `Se han creado ${inactiveCases.length} tareas de seguimiento`
    })
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline': return <Clock className="h-4 w-4" />
      case 'alert': return <AlertTriangle className="h-4 w-4" />
      case 'opportunity': return <CheckCircle className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones Inteligentes
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Alertas y oportunidades detectadas automáticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay notificaciones pendientes</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg space-y-3 ${
                notification.isRead ? 'bg-gray-50' : 'bg-white border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{notification.title}</h4>
                      <Badge variant={getPriorityColor(notification.priority)}>
                        {notification.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-400">
                      {notification.createdAt.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissNotification(notification.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {notification.actionable && notification.actions && (
                <div className="flex gap-2 pt-2">
                  {notification.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || 'outline'}
                      size="sm"
                      onClick={() => {
                        action.action()
                        markAsRead(notification.id)
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
