import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, MapPin, FileText } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { type Interview } from '@/types/recruitment'

interface InterviewDetailsPanelProps {
  interview: Interview & { candidate?: any }
}

export function InterviewDetailsPanel({ interview }: InterviewDetailsPanelProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'scheduled': 'bg-primary',
      'completed': 'bg-success',
      'cancelled': 'bg-destructive'
    }
    return colors[status] || 'bg-muted'
  }

  const getTypeColor = (type?: string) => {
    const colors: Record<string, string> = {
      'phone': 'bg-blue-100 text-blue-800',
      'video': 'bg-green-100 text-green-800',
      'in_person': 'bg-purple-100 text-purple-800',
      'technical': 'bg-orange-100 text-orange-800'
    }
    return colors[type || ''] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Información del candidato */}
      <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Candidato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {interview.candidate && (
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src="" />
                <AvatarFallback>
                  {interview.candidate.first_name?.[0]}{interview.candidate.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {interview.candidate.first_name} {interview.candidate.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">{interview.candidate.email}</p>
                {interview.candidate.current_position && (
                  <p className="text-sm text-muted-foreground">
                    {interview.candidate.current_position}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detalles de la entrevista */}
      <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detalles de la Entrevista
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                <div className="mt-1">
                  <Badge className={getStatusColor(interview.status)}>
                    {interview.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                <div className="mt-1">
                  <Badge variant="outline" className={getTypeColor(interview.interview_type)}>
                    {interview.interview_type}
                  </Badge>
                </div>
              </div>

              {interview.candidate?.current_position && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Posición del candidato</label>
                  <p className="mt-1 text-sm">{interview.candidate.current_position}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {interview.scheduled_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha y hora</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(interview.scheduled_at).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(interview.scheduled_at).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              )}

              {interview.location && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ubicación</label>
                  <div className="mt-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{interview.location}</span>
                  </div>
                </div>
              )}

              {interview.duration_minutes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duración</label>
                  <p className="mt-1 text-sm">{interview.duration_minutes} minutos</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Estado de la entrevista</label>
            <div className="mt-1 p-3 bg-muted rounded-[10px]">
              <p className="text-sm">
                {interview.status === 'completed' && 'Entrevista completada'}
                {interview.status === 'scheduled' && 'Entrevista programada'}
                {interview.status === 'cancelled' && 'Entrevista cancelada'}
                {!['completed', 'scheduled', 'cancelled'].includes(interview.status) && interview.status}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}