
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, MessageSquare, VideoIcon, Plus, FileText } from 'lucide-react'
import { useClientCommunications } from '@/hooks/useClientCommunications'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ContactCommunicationsTabProps {
  contactId: string
}

export const ContactCommunicationsTab = ({ contactId }: ContactCommunicationsTabProps) => {
  const { communications, isLoading, metrics } = useClientCommunications(contactId)

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'call':
        return <Phone className="h-4 w-4" />
      case 'meeting':
        return <VideoIcon className="h-4 w-4" />
      case 'note':
        return <FileText className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getCommunicationColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800'
      case 'call':
        return 'bg-green-100 text-green-800'
      case 'meeting':
        return 'bg-purple-100 text-purple-800'
      case 'note':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDirectionBadge = (direction: string) => {
    return direction === 'inbound' ? 'Entrante' : 'Saliente'
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comunicaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Cargando comunicaciones...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas de comunicaciones */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Emails</p>
                <p className="text-2xl font-bold">{metrics.emailsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Llamadas</p>
                <p className="text-2xl font-bold">{metrics.callsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <VideoIcon className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Reuniones</p>
                <p className="text-2xl font-bold">{metrics.meetingsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Notas</p>
                <p className="text-2xl font-bold">{metrics.notesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de comunicaciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Historial de Comunicaciones
            </CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Actividad
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {communications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay comunicaciones registradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {communications.map((comm) => (
                <div key={comm.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${getCommunicationColor(comm.type)}`}>
                        {getCommunicationIcon(comm.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{comm.subject}</h4>
                          <Badge variant="outline" className="text-xs">
                            {getDirectionBadge(comm.direction)}
                          </Badge>
                        </div>
                        {comm.content && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {comm.content}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            {format(new Date(comm.date), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </span>
                          {comm.duration_minutes && (
                            <span>Duración: {comm.duration_minutes} min</span>
                          )}
                          {comm.participants && comm.participants.length > 0 && (
                            <span>Participantes: {comm.participants.length}</span>
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
    </div>
  )
}
