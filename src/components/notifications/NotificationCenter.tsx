
import React from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useGlobalNotifications } from '@/hooks/useGlobalStateSelectors'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const colorMap = {
  success: 'text-green-600 bg-green-50 border-green-200',
  error: 'text-red-600 bg-red-50 border-red-200',
  warning: 'text-orange-600 bg-orange-50 border-orange-200',
  info: 'text-blue-600 bg-blue-50 border-blue-200'
}

// Memoizar el componente de notificación individual
const NotificationItem = React.memo(({ notification, onRemove }: {
  notification: any
  onRemove: (id: string) => void
}) => {
  const Icon = iconMap[notification.type]
  const colorClasses = colorMap[notification.type]
  
  return (
    <Card
      className={`p-4 border-l-4 ${colorClasses} animate-slide-in-right`}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">
            {notification.message}
          </p>
          {notification.description && (
            <p className="text-xs text-gray-600 mt-1">
              {notification.description}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {notification.timestamp.toLocaleTimeString()}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(notification.id)}
          className="h-6 w-6 p-0 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
})

NotificationItem.displayName = 'NotificationItem'

export const NotificationCenter: React.FC = React.memo(() => {
  const { notifications, removeNotification, clearNotifications } = useGlobalNotifications()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.length > 1 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={clearNotifications}
            className="text-xs"
          >
            Limpiar todas
          </Button>
        </div>
      )}
      
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  )
})

NotificationCenter.displayName = 'NotificationCenter'
