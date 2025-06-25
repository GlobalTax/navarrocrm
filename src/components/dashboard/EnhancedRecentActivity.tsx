
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle,
  Calendar,
  MoreHorizontal
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useDashboardData } from '@/hooks/useDashboardData'
import { RecentActivity } from '@/types/dashboardTypes'
import { useNavigate } from 'react-router-dom'

const getActivityIcon = (type: RecentActivity['type']) => {
  switch (type) {
    case 'client': return Users
    case 'case': return FileText
    case 'time_entry': return Clock
    case 'task': return CheckCircle
    case 'proposal': return Calendar
  }
}

const getActivityColor = (type: RecentActivity['type']) => {
  switch (type) {
    case 'client': return 'bg-blue-100 text-blue-700'
    case 'case': return 'bg-green-100 text-green-700'
    case 'time_entry': return 'bg-orange-100 text-orange-700'
    case 'task': return 'bg-purple-100 text-purple-700'
    case 'proposal': return 'bg-indigo-100 text-indigo-700'
  }
}

const getActivityBadgeColor = (type: RecentActivity['type']) => {
  switch (type) {
    case 'client': return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'case': return 'bg-green-50 text-green-700 border-green-200'
    case 'time_entry': return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'task': return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'proposal': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
  }
}

export const EnhancedRecentActivity = () => {
  const { data: dashboardData, isLoading } = useDashboardData()
  const navigate = useNavigate()

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

  const activities = dashboardData?.recentActivity || []

  const handleActivityClick = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'client':
        navigate('/clients')
        break
      case 'case':
        navigate('/cases')
        break
      case 'time_entry':
        navigate('/time-tracking')
        break
      case 'task':
        navigate('/tasks')
        break
      case 'proposal':
        navigate('/proposals')
        break
    }
  }

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
                onClick={() => handleActivityClick(activity)}
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
}
