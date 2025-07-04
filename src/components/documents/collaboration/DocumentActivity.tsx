import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Activity, FileText, MessageSquare, Share, GitCommit, User, Clock } from 'lucide-react'
import { DocumentActivity as DocumentActivityType, useDocumentCollaboration } from '@/hooks/useDocumentCollaboration'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface DocumentActivityProps {
  documentId: string
}

export const DocumentActivity = ({ documentId }: DocumentActivityProps) => {
  const { activities } = useDocumentCollaboration(documentId)

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case 'created':
        return <FileText className="h-4 w-4 text-primary" />
      case 'edited':
        return <FileText className="h-4 w-4 text-warning" />
      case 'commented':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'shared':
        return <Share className="h-4 w-4 text-green-500" />
      case 'version_created':
        return <GitCommit className="h-4 w-4 text-purple-500" />
      case 'status_changed':
        return <Activity className="h-4 w-4 text-orange-500" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getActivityDescription = (activity: DocumentActivityType) => {
    const details = activity.details || {}
    
    switch (activity.action_type) {
      case 'created':
        return 'creó el documento'
      case 'edited':
        return 'editó el documento'
      case 'commented':
        return 'agregó un comentario'
      case 'shared':
        return `compartió el documento${details.shared_with ? ` con ${details.shared_with}` : ''}`
      case 'version_created':
        return `creó la versión ${details.version_number || 'nueva'}`
      case 'status_changed':
        return `cambió el estado${details.new_status ? ` a ${details.new_status}` : ''}`
      default:
        return 'realizó una acción'
    }
  }

  const getActivityColor = (actionType: string) => {
    switch (actionType) {
      case 'created':
        return 'bg-primary/10 text-primary-foreground border-primary/20'
      case 'edited':
        return 'bg-warning/10 text-warning-foreground border-warning/20'
      case 'commented':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20'
      case 'shared':
        return 'bg-green-500/10 text-green-700 border-green-500/20'
      case 'version_created':
        return 'bg-purple-500/10 text-purple-700 border-purple-500/20'
      case 'status_changed':
        return 'bg-orange-500/10 text-orange-700 border-orange-500/20'
      default:
        return 'bg-muted/50 text-muted-foreground border-muted'
    }
  }

  const getUserInitials = (userId: string) => {
    // En una implementación real, esto vendría de la info del usuario
    return 'U'
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Actividad Reciente
          <Badge variant="secondary" className="ml-auto">
            {activities.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-3 p-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay actividad reciente</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.action_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getUserInitials(activity.user_id)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <span className="text-sm font-medium">Usuario</span>
                      
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getActivityColor(activity.action_type)}`}
                      >
                        {activity.action_type}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-foreground/80 mb-2">
                      {getActivityDescription(activity)}
                    </p>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(activity.created_at), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </div>
                    
                    {/* Mostrar detalles adicionales si existen */}
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <details>
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            Ver detalles
                          </summary>
                          <div className="mt-1 space-y-1">
                            {Object.entries(activity.details).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="font-medium">{key}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}