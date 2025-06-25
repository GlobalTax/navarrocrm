
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useClientCommunications } from '@/hooks/useClientCommunications'
import { ClientCommunicationActions } from './ClientCommunicationActions'
import { 
  Mail, 
  Phone, 
  Video, 
  StickyNote,
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react'

interface ClientCommunicationsSectionProps {
  clientId: string
  clientName?: string
  clientEmail?: string
}

const getCommunicationIcon = (type: string) => {
  switch (type) {
    case 'email':
      return <Mail className="h-4 w-4" />
    case 'call':
      return <Phone className="h-4 w-4" />
    case 'meeting':
      return <Video className="h-4 w-4" />
    case 'note':
      return <StickyNote className="h-4 w-4" />
    default:
      return <Calendar className="h-4 w-4" />
  }
}

const getCommunicationColor = (type: string) => {
  switch (type) {
    case 'email':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'call':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'meeting':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'note':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getDirectionIcon = (direction: string) => {
  return direction === 'inbound' ? 
    <ArrowDownLeft className="h-3 w-3 text-green-600" /> : 
    <ArrowUpRight className="h-3 w-3 text-blue-600" />
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'email':
      return 'Email'
    case 'call':
      return 'Llamada'
    case 'meeting':
      return 'Reunión'
    case 'note':
      return 'Nota'
    default:
      return type
  }
}

export const ClientCommunicationsSection = ({ 
  clientId, 
  clientName = 'Cliente',
  clientEmail 
}: ClientCommunicationsSectionProps) => {
  const { communications, metrics, isLoading, refetch } = useClientCommunications(clientId)

  if (isLoading) {
    return <div className="animate-pulse">Cargando comunicaciones...</div>
  }

  const handleCommunicationCreated = () => {
    refetch()
  }

  return (
    <div className="space-y-6">
      {/* Métricas Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.emailsCount}
            </div>
            <div className="text-sm text-gray-600">Emails</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Phone className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {metrics.callsCount}
            </div>
            <div className="text-sm text-gray-600">Llamadas</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Video className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.meetingsCount}
            </div>
            <div className="text-sm text-gray-600">Reuniones</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.totalCallDuration}m
            </div>
            <div className="text-sm text-gray-600">Tiempo Llamadas</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <StickyNote className="h-5 w-5 text-gray-600" />
            </div>
            <div className="text-2xl font-bold text-gray-600">
              {metrics.notesCount}
            </div>
            <div className="text-sm text-gray-600">Notas</div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <ClientCommunicationActions
        clientId={clientId}
        clientName={clientName}
        clientEmail={clientEmail}
        onCommunicationCreated={handleCommunicationCreated}
      />

      {/* Historial de Comunicaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historial de Comunicaciones ({communications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {communications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay comunicaciones registradas para este cliente</p>
              <p className="text-sm mt-2">Las comunicaciones aparecerán aquí cuando se registren</p>
            </div>
          ) : (
            <div className="space-y-4">
              {communications.map((comm, index) => (
                <div key={comm.id} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`p-2 rounded-full border-2 ${getCommunicationColor(comm.type)}`}>
                      {getCommunicationIcon(comm.type)}
                    </div>
                    {index < communications.length - 1 && (
                      <div className="w-px h-8 bg-gray-200 mt-2" />
                    )}
                  </div>

                  {/* Communication content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {comm.subject}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(comm.type)}
                          </Badge>
                          {getDirectionIcon(comm.direction)}
                        </div>
                        
                        {comm.content && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {comm.content}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <span>
                            {new Date(comm.date).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          
                          {comm.duration_minutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{comm.duration_minutes} min</span>
                            </div>
                          )}
                          
                          {comm.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{comm.location}</span>
                            </div>
                          )}
                          
                          {comm.participants.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{comm.participants.length} participantes</span>
                            </div>
                          )}
                        </div>

                        {comm.participants.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {comm.participants.slice(0, 3).map((participant, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {participant}
                              </Badge>
                            ))}
                            {comm.participants.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{comm.participants.length - 3} más
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
