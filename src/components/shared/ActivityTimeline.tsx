import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ACTIVITY_STATUS_LABELS } from '@/types/features/employee-data'
import type { EmployeeActivity, CandidateActivity } from '@/types/features/employee-data'

interface ActivityTimelineProps {
  activities: (EmployeeActivity | CandidateActivity)[]
  isLoading?: boolean
}

export function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex space-x-4 animate-pulse">
            <div className="w-10 h-10 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No hay actividades registradas</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <Card key={activity.id} className="border-l-4" style={{ borderLeftColor: activity.activity_type?.color || '#6366f1' }}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src="" />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-sm">{activity.title}</h4>
                    {activity.activity_type && (
                      <Badge variant="secondary" className="text-xs">
                        {activity.activity_type.name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={activity.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {ACTIVITY_STATUS_LABELS[activity.status]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(activity.activity_date), 'dd MMM yyyy, HH:mm', { locale: es })}
                    </span>
                  </div>
                </div>
                
                {activity.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.description}
                  </p>
                )}
                
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="mt-2 p-2 bg-muted/50 rounded-md">
                    <p className="text-xs text-muted-foreground">Información adicional:</p>
                    <div className="mt-1 text-xs">
                      {Object.entries(activity.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium">{key}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}