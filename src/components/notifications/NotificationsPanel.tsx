
import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Bell, Check, X, ExternalLink, CheckCheck } from 'lucide-react'
import { Notification } from '@/hooks/useNotifications'
import { useNavigate } from 'react-router-dom'

interface NotificationsPanelProps {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onRemove: (id: string) => void
  onClose: () => void
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemove,
  onClose
}) => {
  const navigate = useNavigate()

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return 'ℹ️'
    }
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Ahora'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d`
    
    return date.toLocaleDateString('es-ES')
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
      onClose()
    }
  }

  return (
    <div className="w-80 bg-white border-0.5 border-black rounded-[10px] shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-0.5 border-gray-200">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="font-semibold">Notificaciones</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-xs gap-1"
          >
            <CheckCheck className="h-3 w-3" />
            Marcar todas
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="max-h-96">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay notificaciones</p>
          </div>
        ) : (
          <div className="p-2">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <div
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50
                    ${!notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                        <h4 className={`text-sm font-medium truncate ${!notification.isRead ? 'text-blue-900' : 'text-gray-900'}`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        
                        {notification.actionLabel && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <span>{notification.actionLabel}</span>
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onMarkAsRead(notification.id)
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemove(notification.id)
                        }}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {index < notifications.length - 1 && (
                  <Separator className="my-1" />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t-0.5 border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              navigate('/notifications')
              onClose()
            }}
          >
            Ver todas las notificaciones
          </Button>
        </div>
      )}
    </div>
  )
}
