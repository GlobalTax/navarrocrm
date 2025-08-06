import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { DetailPageHeader } from '@/components/layout/DetailPageHeader'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, MapPin, Video, Phone, User, Building, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { type Interview, INTERVIEW_TYPE_LABELS } from '@/types/recruitment'

export default function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useApp()

  const { data: interview, isLoading } = useQuery({
    queryKey: ['interview', id],
    queryFn: async () => {
      if (!id) throw new Error('ID de la entrevista no proporcionado')
      
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          candidate:candidates(first_name, last_name, email, phone, current_position)
        `)
        .eq('id', id)
        .eq('org_id', user?.org_id)
        .single()
      
      if (error) throw error
      return data as Interview & { candidate: any }
    },
    enabled: !!id && !!user?.org_id
  })

  if (isLoading) {
    return (
      <StandardPageContainer>
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </StandardPageContainer>
    )
  }

  if (!interview) {
    return (
      <StandardPageContainer>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Entrevista no encontrada</h2>
          <p className="text-gray-600 mt-2">La entrevista que buscas no existe o no tienes permisos para verla.</p>
        </div>
      </StandardPageContainer>
    )
  }

  const candidateName = interview.candidate 
    ? `${interview.candidate.first_name} ${interview.candidate.last_name}`
    : 'Candidato no disponible'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Phone className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'in_person':
        return <MapPin className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  return (
    <StandardPageContainer>
      <DetailPageHeader
    title={`Entrevista con ${candidateName}`}
        subtitle="Entrevista"
        breadcrumbItems={[
          { label: 'Reclutamiento', href: '/recruitment' },
          { label: 'Entrevistas' },
          { label: candidateName }
        ]}
        backUrl="/recruitment"
      >
        <Button variant="outline" size="sm" className="gap-2 border-0.5 border-foreground rounded-[10px]">
          <Edit className="h-4 w-4" />
          Editar
        </Button>
        <Button variant="outline" size="sm" className="gap-2 border-0.5 border-foreground rounded-[10px] text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>
      </DetailPageHeader>
      
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Detalles de la Entrevista
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Fecha y Hora</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(interview.scheduled_at), 'dd/MM/yyyy', { locale: es })}</span>
                    <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                    <span>{format(new Date(interview.scheduled_at), 'HH:mm', { locale: es })}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Duración</label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{interview.duration_minutes ? `${interview.duration_minutes} minutos` : 'No especificada'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Tipo de Entrevista</label>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(interview.interview_type)}
                    <span>{INTERVIEW_TYPE_LABELS[interview.interview_type] || interview.interview_type}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <Badge variant="outline" className={`border-0.5 rounded-[10px] w-fit ${getStatusColor(interview.status)}`}>
                    {interview.status === 'scheduled' ? 'Programada' :
                     interview.status === 'completed' ? 'Completada' :
                     interview.status === 'cancelled' ? 'Cancelada' :
                     interview.status === 'no_show' ? 'No presentado' : interview.status}
                  </Badge>
                </div>
              </div>

              {interview.location && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Ubicación</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{interview.location}</span>
                  </div>
                </div>
              )}

              {interview.meeting_url && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Enlace de la Reunión</label>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={interview.meeting_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {interview.meeting_url}
                    </a>
                  </div>
                </div>
              )}

              {interview.evaluation_notes && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Notas de Evaluación</label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{interview.evaluation_notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evaluación de la Entrevista */}
          {(interview.technical_assessment || interview.cultural_fit_notes || interview.recommendation) && (
            <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm">
              <CardHeader>
                <CardTitle>Evaluación de la Entrevista</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interview.technical_assessment && (
                    <div>
                      <h4 className="font-medium mb-2">Evaluación Técnica</h4>
                      <div className="p-3 bg-muted rounded-lg">
                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {JSON.stringify(interview.technical_assessment, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  {interview.cultural_fit_notes && (
                    <div>
                      <h4 className="font-medium mb-2">Ajuste Cultural</h4>
                      <p className="text-sm text-muted-foreground">{interview.cultural_fit_notes}</p>
                    </div>
                  )}
                  {interview.recommendation && (
                    <div>
                      <h4 className="font-medium mb-2">Recomendación</h4>
                      <Badge variant="outline" className="border-0.5 rounded-[10px]">
                        {interview.recommendation}
                      </Badge>
                    </div>
                  )}
                  {interview.evaluation_score && (
                    <div>
                      <h4 className="font-medium mb-2">Puntuación</h4>
                      <span className="text-lg font-semibold">{interview.evaluation_score}/10</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel del Candidato */}
        <div className="space-y-6">
          <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Candidato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {interview.candidate && (
                <>
                  <div>
                    <h3 className="font-semibold text-lg">{candidateName}</h3>
                    <p className="text-sm text-muted-foreground">{interview.candidate.current_position}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Email:</span>
                      <span className="text-sm text-muted-foreground">{interview.candidate.email}</span>
                    </div>
                    {interview.candidate.phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Teléfono:</span>
                        <span className="text-sm text-muted-foreground">{interview.candidate.phone}</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-0.5 border-foreground rounded-[10px]"
                    onClick={() => window.open(`/recruitment/candidates/${interview.candidate_id}`, '_blank')}
                  >
                    Ver Perfil Completo
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Información Adicional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ronda:</span>
                <span className="text-sm text-muted-foreground">#{interview.interview_round}</span>
              </div>
              {interview.strengths && interview.strengths.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Fortalezas:</span>
                  <div className="mt-1">
                    {interview.strengths.map((strength, index) => (
                      <span key={index} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {interview.concerns && interview.concerns.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Preocupaciones:</span>
                  <div className="mt-1">
                    {interview.concerns.map((concern, index) => (
                      <span key={index} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardPageContainer>
  )
}