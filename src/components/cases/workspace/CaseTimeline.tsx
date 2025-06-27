
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Timeline, TimelineItem, TimelineMarker, TimelineContent } from '@/components/ui/timeline'
import { Clock, FileText, User, Phone, Mail, Calendar, CheckCircle2 } from 'lucide-react'
import { Case } from '@/hooks/useCases'

interface CaseTimelineProps {
  case_: Case
}

interface TimelineEvent {
  id: string
  title: string
  description: string
  date: string
  type: 'task' | 'document' | 'communication' | 'meeting' | 'milestone' | 'note'
  user?: string
  details?: any
}

export function CaseTimeline({ case_ }: CaseTimelineProps) {
  const events: TimelineEvent[] = [
    {
      id: '1',
      title: 'Expediente creado',
      description: 'Se ha iniciado el expediente y asignado el equipo legal',
      date: '2024-01-10T09:00:00Z',
      type: 'milestone',
      user: 'Ana García'
    },
    {
      id: '2',
      title: 'Documentación inicial recibida',
      description: 'Cliente ha proporcionado contratos y documentos relevantes',
      date: '2024-01-12T14:30:00Z',
      type: 'document',
      user: 'Carlos López',
      details: { documentsCount: 5 }
    },
    {
      id: '3',
      title: 'Llamada con el cliente',
      description: 'Reunión inicial para definir estrategia y expectativas',
      date: '2024-01-15T10:00:00Z',
      type: 'communication',
      user: 'Ana García',
      details: { duration: 45, type: 'call' }
    },
    {
      id: '4',
      title: 'Análisis legal completado',
      description: 'Revisión completa de la documentación y precedentes legales',
      date: '2024-01-18T16:45:00Z',
      type: 'task',
      user: 'María Rodríguez',
      details: { hoursSpent: 3.5 }
    },
    {
      id: '5',
      title: 'Email enviado a contraparte',
      description: 'Propuesta inicial de resolución enviada',
      date: '2024-01-20T11:15:00Z',
      type: 'communication',
      user: 'Ana García',
      details: { type: 'email', subject: 'Propuesta de Resolución - Caso XYZ' }
    },
    {
      id: '6',
      title: 'Reunión programada',
      description: 'Cita con mediador para el próximo viernes',
      date: '2024-01-22T13:20:00Z',
      type: 'meeting',
      user: 'Carlos López',
      details: { scheduledFor: '2024-01-26T15:00:00Z' }
    }
  ]

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'document':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'communication':
        return <Mail className="h-4 w-4 text-purple-600" />
      case 'meeting':
        return <Calendar className="h-4 w-4 text-orange-600" />
      case 'milestone':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-green-100 text-green-800'
      case 'document':
        return 'bg-blue-100 text-blue-800'
      case 'communication':
        return 'bg-purple-100 text-purple-800'
      case 'meeting':
        return 'bg-orange-100 text-orange-800'
      case 'milestone':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'task':
        return 'Tarea'
      case 'document':
        return 'Documento'
      case 'communication':
        return 'Comunicación'
      case 'meeting':
        return 'Reunión'
      case 'milestone':
        return 'Hito'
      default:
        return 'Evento'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Timeline del Expediente</h2>
        <Badge variant="outline">
          {events.length} eventos
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Actividades</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline>
            {events.map((event, index) => {
              const formattedDate = formatDate(event.date)
              const isLast = index === events.length - 1

              return (
                <TimelineItem key={event.id} isLast={isLast}>
                  <TimelineMarker className="bg-white border-2 border-gray-200">
                    {getEventIcon(event.type)}
                  </TimelineMarker>
                  
                  <TimelineContent>
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{event.title}</h4>
                              <p className="text-gray-600">{event.description}</p>
                            </div>
                            <Badge className={getEventColor(event.type)}>
                              {getEventTypeLabel(event.type)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{formattedDate.date} a las {formattedDate.time}</span>
                            </div>
                            
                            {event.user && (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{event.user}</span>
                              </div>
                            )}
                          </div>

                          {/* Detalles específicos por tipo de evento */}
                          {event.details && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              {event.type === 'document' && event.details.documentsCount && (
                                <p className="text-sm">
                                  <strong>Documentos:</strong> {event.details.documentsCount} archivos
                                </p>
                              )}
                              
                              {event.type === 'communication' && event.details.duration && (
                                <p className="text-sm">
                                  <strong>Duración:</strong> {event.details.duration} minutos
                                </p>
                              )}
                              
                              {event.type === 'communication' && event.details.subject && (
                                <p className="text-sm">
                                  <strong>Asunto:</strong> {event.details.subject}
                                </p>
                              )}
                              
                              {event.type === 'task' && event.details.hoursSpent && (
                                <p className="text-sm">
                                  <strong>Tiempo invertido:</strong> {event.details.hoursSpent} horas
                                </p>
                              )}
                              
                              {event.type === 'meeting' && event.details.scheduledFor && (
                                <p className="text-sm">
                                  <strong>Programada para:</strong> {formatDate(event.details.scheduledFor).date} a las {formatDate(event.details.scheduledFor).time}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TimelineContent>
                </TimelineItem>
              )
            })}
          </Timeline>
        </CardContent>
      </Card>
    </div>
  )
}
