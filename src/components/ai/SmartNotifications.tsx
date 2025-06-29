
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Clock, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { toast } from 'sonner'

export const SmartNotifications = () => {
  const { notifications, unreadCount, markAsRead, removeNotification } = useNotifications()

  const getPriorityColor = (type: string) => {
    switch (type) {
      case 'error': return 'destructive'
      case 'warning': return 'default'
      case 'success': return 'secondary'
      default: return 'outline'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return <Clock className="h-4 w-4" />
      case 'error': return <AlertTriangle className="h-4 w-4" />
      case 'success': return <CheckCircle className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const handleAction = (notificationId: string, actionUrl?: string) => {
    if (actionUrl) {
      window.location.href = actionUrl
    }
    markAsRead(notificationId)
    toast.success('Acción completada')
  }

  // Mostrar solo notificaciones no leídas y las 3 más recientes
  const displayNotifications = notifications.filter(n => !n.isRead).slice(0, 3)

  return (
    <Card className="bg-white border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
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
        {displayNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay notificaciones pendientes</p>
          </div>
        ) : (
          displayNotifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 border-0.5 border-gray-200 rounded-lg space-y-3 bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{notification.title}</h4>
                      <Badge variant={getPriorityColor(notification.type)}>
                        {notification.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-400">
                      {notification.createdAt.toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNotification(notification.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {notification.actionUrl && (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(notification.id, notification.actionUrl)}
                  >
                    {notification.actionLabel || 'Ver detalles'}
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
