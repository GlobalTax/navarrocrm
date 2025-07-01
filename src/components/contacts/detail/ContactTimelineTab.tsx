
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, FileText, MessageSquare, Briefcase, Users, CheckCircle } from 'lucide-react'
import { useClientTimeline } from '@/hooks/useClientTimeline'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ContactTimelineTabProps {
  contactId: string
}

export const ContactTimelineTab = ({ contactId }: ContactTimelineTabProps) => {
  const { timeline, isLoading } = useClientTimeline(contactId)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'proposal':
        return <FileText className="h-4 w-4" />
      case 'case':
        return <Briefcase className="h-4 w-4" />
      case 'note':
        return <MessageSquare className="h-4 w-4" />
      case 'status_change':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'proposal':
        return 'bg-blue-500'
      case 'case':
        return 'bg-green-500'
      case 'note':
        return 'bg-purple-500'
      case 'status_change':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline de Actividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Cargando timeline...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline de Actividades
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timeline.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay actividades registradas para este contacto</p>
          </div>
        ) : (
          <div className="space-y-4">
            {timeline.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-full text-white ${getActivityColor(event.type)}`}>
                    {getActivityIcon(event.type)}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-px h-8 bg-gray-300 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <time className="text-xs text-gray-500">
                          {format(new Date(event.date), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </time>
                        {event.status && (
                          <Badge variant="outline" className="text-xs">
                            {event.status}
                          </Badge>
                        )}
                        {event.amount && (
                          <Badge variant="outline" className="text-xs text-green-600">
                            {new Intl.NumberFormat('es-ES', {
                              style: 'currency',
                              currency: 'EUR'
                            }).format(event.amount)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
