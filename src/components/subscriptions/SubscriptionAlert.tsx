import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'
import { useSubscriptionNotificationCount } from '@/hooks/useSubscriptionNotifications'

interface SubscriptionAlertProps {
  showIcon?: boolean
  variant?: 'default' | 'destructive' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const SubscriptionAlert = ({ 
  showIcon = true, 
  variant = 'destructive',
  size = 'md' 
}: SubscriptionAlertProps) => {
  const notificationCount = useSubscriptionNotificationCount()

  if (notificationCount === 0) return null

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-5 w-5 text-xs'
      case 'lg': return 'h-8 w-8 text-base'
      default: return 'h-6 w-6 text-sm'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 12
      case 'lg': return 18
      default: return 14
    }
  }

  return (
    <Badge 
      variant={variant}
      className={`
        ${getSizeClasses()} 
        rounded-full flex items-center justify-center gap-1 
        animate-pulse border-0.5 
        hover:scale-105 transition-transform duration-200
      `}
    >
      {showIcon && <Bell size={getIconSize()} />}
      <span className="font-medium">{notificationCount}</span>
    </Badge>
  )
}