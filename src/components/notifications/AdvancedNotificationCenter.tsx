
import React, { useState, useCallback } from 'react'
import { Bell, X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGlobalStateContext } from '@/contexts/GlobalStateContext'
import { cn } from '@/lib/utils'

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-500" />
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    case 'info':
      return <Info className="h-5 w-5 text-blue-500" />
    default:
      return <Info className="h-5 w-5 text-blue-500" />
  }
}

const getNotificationStyles = (type: string) => {
  switch (type) {
    case 'success':
      return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
    case 'error':
      return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
    case 'warning':
      return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800'
    case 'info':
      return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'
    default:
      return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800'
  }
}

export const AdvancedNotificationCenter: React.FC = () => {
  const { notifications, removeNotification, markAsRead, markAllAsRead, clearNotifications } = useGlobalStateContext()
  const [isOpen, setIsOpen] = useState(false)
  
  const unreadCount = notifications.filter(n => !n.read).length
  const maxNotifications = 50

  const handleMarkAsRead = useCallback((id: string) => {
    markAsRead(id)
  }, [markAsRead])

  const handleRemove = useCallback((id: string) => {
    removeNotification(id)
  }, [removeNotification])

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `Hace ${minutes} min`
    if (hours < 24) return `Hace ${hours} h`
    if (days < 7) return `Hace ${days} días`
    return timestamp.toLocaleDateString('es-ES')
  }

  const sortedNotifications = notifications
    .sort((a, b) => {
      // Primero las no leídas, luego por timestamp
      if (a.read !== b.read) return a.read ? 1 : -1
      return b.timestamp.getTime() - a.timestamp.getTime()
    })
    .slice(0, maxNotifications)

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer clic fuera */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 top-full mt-2 w-80 z-50">
            <Card className="shadow-lg border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Notificaciones</CardTitle>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          markAllAsRead()
                          setIsOpen(false)
                        }}
                        className="text-xs"
                      >
                        Marcar todas como leídas
                      </Button>
                    )}
                    {notifications.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          clearNotifications()
                          setIsOpen(false)
                        }}
                        className="text-xs"
                      >
                        Limpiar
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  {sortedNotifications.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-500">
                      <div className="text-center">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No hay notificaciones</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {sortedNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'p-3 rounded-lg border transition-all duration-200',
                            getNotificationStyles(notification.type),
                            !notification.read && 'ring-2 ring-blue-200 dark:ring-blue-800'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-sm">
                                  {notification.title}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemove(notification.id)}
                                  className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {notification.message}
                              </p>
                              {notification.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {notification.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                <div className="flex items-center gap-2">
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMarkAsRead(notification.id)}
                                      className="text-xs h-6 px-2"
                                    >
                                      Marcar como leída
                                    </Button>
                                  )}
                                  {notification.action && (
                                    <Button
                                      variant={notification.action.variant || 'outline'}
                                      size="sm"
                                      onClick={() => {
                                        notification.action!.onClick()
                                        handleMarkAsRead(notification.id)
                                        setIsOpen(false)
                                      }}
                                      className="text-xs h-6 px-2"
                                    >
                                      {notification.action.label}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
