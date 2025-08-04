import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, FileText, MessageSquare, CheckCircle, AlertCircle, User } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface CaseTimelineProps {
  caseId: string
}

// Mock timeline events - replace with actual hook when available
const mockTimelineEvents = [
  {
    id: '1',
    type: 'case_created',
    title: 'Expediente creado',
    description: 'Se ha creado el expediente "Revisión contrato comercial"',
    user: 'María García',
    timestamp: '2024-01-10T09:00:00Z',
    icon: 'plus'
  },
  {
    id: '2',
    type: 'document_uploaded',
    title: 'Documento subido',
    description: 'Se ha subido el archivo "Contrato_Principal_v1.pdf"',
    user: 'Juan Pérez',
    timestamp: '2024-01-10T10:30:00Z',
    icon: 'file'
  },
  {
    id: '3',
    type: 'task_completed',
    title: 'Tarea completada',
    description: 'Se completó la tarea "Revisión inicial de documentación"',
    user: 'Ana López',
    timestamp: '2024-01-11T14:15:00Z',
    icon: 'check'
  },
  {
    id: '4',
    type: 'comment_added',
    title: 'Comentario añadido',
    description: 'Se añadió un comentario: "Revisar cláusula 15 - posible conflicto"',
    user: 'María García',
    timestamp: '2024-01-12T16:45:00Z',
    icon: 'message'
  },
  {
    id: '5',
    type: 'status_changed',
    title: 'Estado actualizado',
    description: 'El estado del expediente cambió de "Pendiente" a "En Progreso"',
    user: 'Juan Pérez',
    timestamp: '2024-01-13T11:20:00Z',
    icon: 'alert'
  }
]

const getIcon = (iconType: string) => {
  switch (iconType) {
    case 'file': return FileText
    case 'check': return CheckCircle
    case 'message': return MessageSquare
    case 'alert': return AlertCircle
    case 'user': return User
    default: return Clock
  }
}

const getEventColor = (type: string) => {
  switch (type) {
    case 'case_created': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'document_uploaded': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'task_completed': return 'bg-green-100 text-green-800 border-green-200'
    case 'comment_added': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'status_changed': return 'bg-orange-100 text-orange-800 border-orange-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const CaseTimeline = ({ caseId }: CaseTimelineProps) => {
  const events = mockTimelineEvents // Replace with useCaseTimeline(caseId) when available

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cronología del Expediente</h3>
        <Badge variant="outline">{events.length} eventos</Badge>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

        <div className="space-y-6">
          {events.map((event, index) => {
            const Icon = getIcon(event.icon)
            
            return (
              <div key={event.id} className="relative flex items-start gap-4">
                {/* Timeline dot */}
                <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-background border-2 border-border rounded-full">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>

                {/* Event content */}
                <Card className="flex-1">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge className={getEventColor(event.type)} variant="outline">
                            {event.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {event.user}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(event.timestamp), 'dd MMM yyyy, HH:mm', { locale: es })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      {events.length === 0 && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">No hay eventos en la cronología</h3>
                <p className="text-sm text-muted-foreground">
                  Los eventos del expediente aparecerán aquí a medida que se realicen acciones.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}