
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApp } from '@/contexts/AppContext'
import { LogOut, User, Search, Bell } from 'lucide-react'
import { HeaderClock } from './HeaderClock'
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel'
import { useNotifications, useNotificationActions } from '@/hooks/useNotifications'

export const Header = () => {
  const { user, signOut } = useApp()
  const { data: notificationData } = useNotifications()
  const { markAsRead, markAllAsRead } = useNotificationActions()
  
  const notifications = notificationData?.notifications || []
  const unreadCount = notificationData?.unreadCount || 0
  
  const removeNotification = (notificationId: string) => {
    markAsRead(notificationId)
  }
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Cerrar panel de notificaciones al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar clientes, casos..." 
              className="pl-10 w-80"
            />
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
              
              {/* Notifications Panel */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 z-50 animate-fade-in">
                  <NotificationsPanel
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                    onRemove={removeNotification}
                    onClose={() => setShowNotifications(false)}
                  />
                </div>
              )}
            </div>
            
            {/* Header Clock */}
            <HeaderClock />
            
            {/* User info */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50">
              <User className="h-4 w-4 text-gray-500" />
              <div className="text-sm">
                <span className="font-medium text-gray-700">
                  {user?.email?.split('@')[0]}
                </span>
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {user?.role}
                </span>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
