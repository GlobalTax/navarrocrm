
import React, { memo, useMemo } from 'react'
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
import { useDashboardData, RecentActivity } from '@/hooks/useDashboardData'
import { useNavigate } from 'react-router-dom'
import { usePerformanceMonitor } from '@/hooks/optimization/usePerformanceMonitor'
import { useOptimizedMemo } from '@/hooks/useOptimizedMemo'

// Memoizar configuraciones estáticas
const ACTIVITY_CONFIG = {
  icons: {
    client: Users,
    case: FileText,
    time: Clock,
    task: CheckCircle,
    proposal: Calendar
  },
  colors: {
    client: 'bg-blue-100 text-blue-700',
    case: 'bg-green-100 text-green-700',
    time: 'bg-orange-100 text-orange-700',
    task: 'bg-purple-100 text-purple-700',
    proposal: 'bg-indigo-100 text-indigo-700'
  },
  badgeColors: {
    client: 'bg-blue-50 text-blue-700 border-blue-200',
    case: 'bg-green-50 text-green-700 border-green-200',
    time: 'bg-orange-50 text-orange-700 border-orange-200',
    task: 'bg-purple-50 text-purple-700 border-purple-200',
    proposal: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  }
} as const

// Componente memoizado para cada actividad
const ActivityItem = memo(({ 
  activity, 
  onActivityClick 
}: { 
  activity: RecentActivity
  onActivityClick: (activity: RecentActivity) => void 
}) => {
  const Icon = ACTIVITY_CONFIG.icons[activity.type]
  const iconColor = ACTIVITY_CONFIG.colors[activity.type]
  const badgeColor = ACTIVITY_CONFIG.badgeColors[activity.type]

  // Memoizar el formato de fecha
  const timeAgo = useMemo(() => 
    formatDistanceToNow(activity.timestamp, { 
      addSuffix: true, 
      locale: es 
    }), [activity.timestamp])

  return (
    <div 
      className="group flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded-md transition-colors"
      onClick={() => onActivityClick(activity)}
    >
      <div className={`p-2 rounded-lg ${iconColor}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm">{activity.title}</p>
          <Badge 
            variant="outline" 
            className={`text-xs ${badgeColor}`}
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
            {timeAgo}
          </span>
        </div>
      </div>
    </div>
  )
})

ActivityItem.displayName = 'ActivityItem'

// Hook optimizado para navegación
const useOptimizedNavigation = () => {
  const navigate = useNavigate()
  
  return useMemo(() => ({
    handleActivityClick: (activity: RecentActivity) => {
      switch (activity.type) {
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
        case 'proposal':
          navigate('/proposals')
          break
      }
    }
  }), [navigate])
}

export const OptimizedRecentActivity = memo(() => {
  const { data: dashboardData, isLoading } = useDashboardData()
  const { handleActivityClick } = useOptimizedNavigation()
  const { metrics } = usePerformanceMonitor('OptimizedRecentActivity')

  // Memoizar procesamiento de actividades
  const processedActivities = useOptimizedMemo(() => {
    const activities = dashboardData?.recentActivities || []
    
    // Ordenar y limitar actividades
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10) // Limitar a 10 para performance
  }, [dashboardData?.recentActivities], 'recent-activities')

  // Loading optimizado con skeleton
  if (isLoading) {
    return (
      <Card className="border-0.5 border-gray-200">
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

  return (
    <Card className="border-0.5 border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Actividad Reciente
            {metrics.componentRenders > 50 && (
              <Badge variant="outline" className="ml-2 text-xs">
                {metrics.componentRenders} renders
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {processedActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay actividad reciente</p>
          </div>
        ) : (
          <>
            {processedActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onActivityClick={handleActivityClick}
              />
            ))}
            
            <div className="pt-2">
              <Button variant="ghost" size="sm" className="w-full">
                Ver toda la actividad
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
})

OptimizedRecentActivity.displayName = 'OptimizedRecentActivity'
