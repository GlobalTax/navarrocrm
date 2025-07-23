
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle,
  MoreHorizontal
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { OptimizedDashboardData } from '@/hooks/useOptimizedDashboard'
import { useNavigate } from 'react-router-dom'

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'client': return Users
    case 'case': return FileText
    case 'time': return Clock
    case 'task': return CheckCircle
    default: return Clock
  }
}

const getActivityColor = (type: string) => {
  switch (type) {
    case 'client': return 'bg-blue-100 text-blue-700'
    case 'case': return 'bg-green-100 text-green-700'
    case 'time': return 'bg-orange-100 text-orange-700'
    case 'task': return 'bg-purple-100 text-purple-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getActivityBadgeColor = (type: string) => {
  switch (type) {
    case 'client': return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'case': return 'bg-green-50 text-green-700 border-green-200'
    case 'time': return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'task': return 'bg-purple-50 text-purple-700 border-purple-200'
    default: return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

interface EnhancedRecentActivityProps {
  data: OptimizedDashboardData
  isLoading?: boolean
}

export const EnhancedRecentActivity = React.memo(({ 
  data, 
  isLoading 
}: EnhancedRecentActivityProps) => {
  const navigate = useNavigate()

  const handleActivityClick = React.useCallback((type: string) => {
    switch (type) {
      case 'client':
        navigate('/contacts')
        break
      case 'case':
        navigate('/cases')
        break
      case 'time':
        navigate('/time-tracking')
        break
      case 'task':
        navigate('/tasks')
        break
    }
  }, [navigate])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const activities = data?.recentActivities || []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay actividad reciente</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.type)
            return (
              <div 
                key={activity.id} 
                className="group flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded-md transition-colors"
                onClick={() => handleActivityClick(activity.type)}
              >
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getActivityBadgeColor(activity.type)}`}
                    >
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {activity.user}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
        
        {activities.length > 0 && (
          <div className="pt-2">
            <Button variant="ghost" size="sm" className="w-full">
              Ver toda la actividad
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

EnhancedRecentActivity.displayName = 'EnhancedRecentActivity'
