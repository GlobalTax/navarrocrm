
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useClientTimeline } from '@/hooks/useClientTimeline'
import { 
  Calendar,
  FileText, 
  FolderOpen, 
  StickyNote,
  CheckCircle,
  Clock,
  Euro
} from 'lucide-react'

interface ClientTimelineSectionProps {
  clientId: string
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'proposal':
      return <FileText className="h-4 w-4" />
    case 'case':
      return <FolderOpen className="h-4 w-4" />
    case 'note':
      return <StickyNote className="h-4 w-4" />
    default:
      return <Calendar className="h-4 w-4" />
  }
}

const getEventColor = (type: string, status?: string) => {
  if (type === 'proposal') {
    switch (status) {
      case 'won':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'lost':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  
  if (type === 'case') {
    return status === 'closed' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-blue-100 text-blue-800 border-blue-200'
  }
  
  return 'bg-purple-100 text-purple-800 border-purple-200'
}

export const ClientTimelineSection = ({ clientId }: ClientTimelineSectionProps) => {
  const { timeline, isLoading } = useClientTimeline(clientId)

  if (isLoading) {
    return <div className="animate-pulse">Cargando timeline...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Timeline de Relación
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timeline.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay eventos registrados en el timeline</p>
          </div>
        ) : (
          <div className="space-y-4">
            {timeline.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-full border-2 ${getEventColor(event.type, event.status)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-px h-8 bg-gray-200 mt-2" />
                  )}
                </div>

                {/* Event content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {event.title}
                      </h4>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(event.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {event.status && (
                          <Badge variant="outline" className="text-xs">
                            {event.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {event.amount && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-green-600 font-medium">
                          <Euro className="h-4 w-4" />
                          {event.amount.toLocaleString()}
                        </div>
                      </div>
                    )}
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
