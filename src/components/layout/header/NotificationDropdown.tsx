import React from 'react'
import { Bell, Users, Calendar, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { formatTimeAgo } from '@/lib/utils/dateUtils'
import { useNotifications, useNotificationActions } from '@/hooks/useNotifications'
// import { SubscriptionAlert } from '@/components/subscriptions/SubscriptionAlert'

export const NotificationDropdown = () => {
  const { data: notificationData } = useNotifications()
  const { markAsRead, markAllAsRead } = useNotificationActions()
  
  const notifications = notificationData?.notifications || []
  const unreadCount = notificationData?.unreadCount || 0

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-warning" />
      case 'success':
        return <Users className="h-4 w-4 text-success" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case 'info':
      default:
        return <Calendar className="h-4 w-4 text-info" />
    }
  }

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-[10px]">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full border-0.5"
              >
                {unreadCount}
              </Badge>
            )}
            {/* <div className="absolute -top-2 -right-2">
              <SubscriptionAlert showIcon={false} size="sm" />
            </div> */}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-80 rounded-[10px] border-0.5 shadow-lg"
        >
          <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
            <span className="font-semibold">Notificaciones</span>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Marcar todas como leídas
              </Button>
            )}
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {notifications.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              No tienes notificaciones
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`
                    px-3 py-3 cursor-pointer transition-colors hover:bg-accent/50
                    ${!notification.isRead ? 'bg-primary/5 border-l-2 border-l-primary' : ''}
                  `}
                  onClick={() => {
                    markAsRead(notification.id)
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl
                    }
                  }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                      
                      {notification.actionLabel && (
                        <Badge 
                          variant="outline" 
                          className="mt-2 text-xs h-5 px-2 rounded-[10px] border-0.5"
                        >
                          {notification.actionLabel}
                        </Badge>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}