import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ActivityTimeline } from '@/components/shared/ActivityTimeline'
import { useCandidateActivities } from '@/hooks/recruitment/useCandidateActivities'
import { useCandidateEvaluations } from '@/hooks/recruitment/useCandidateEvaluations'
import { useCandidateReferences } from '@/hooks/recruitment/useCandidateReferences'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  User, 
  Briefcase, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Star,
  FileText,
  Users,
  Languages,
  Award
} from 'lucide-react'
import { type Candidate } from '@/types/recruitment'

interface CandidateDetailsPanelProps {
  candidate: Candidate
}

export function CandidateDetailsPanel({ candidate }: CandidateDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const { data: activities = [], isLoading: activitiesLoading } = useCandidateActivities(candidate.id)
  const { data: evaluations = [], isLoading: evaluationsLoading } = useCandidateEvaluations(candidate.id)
  const { data: references = [], isLoading: referencesLoading } = useCandidateReferences(candidate.id)

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'new': 'bg-primary',
      'in_process': 'bg-warning',
      'interviewed': 'bg-info',
      'offered': 'bg-success',
      'hired': 'bg-success',
      'rejected': 'bg-destructive',
      'withdrawn': 'bg-muted',
    }
    return colors[status] || 'bg-muted'
  }

  return (
    <div className="space-y-6">
      {/* Header del candidato */}
      <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src="" />
              <AvatarFallback className="text-xl">
                {candidate.first_name[0]}{candidate.last_name[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    {candidate.first_name} {candidate.last_name}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-3">
                    {candidate.current_position} {candidate.current_company && `en ${candidate.current_company}`}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {candidate.email}
                    </div>
                    {candidate.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {candidate.phone}
                      </div>
                    )}
                    {candidate.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {candidate.location}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge className={getStatusColor(candidate.status)}>
                    {candidate.status}
                  </Badge>
                  {candidate.source && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Fuente: {candidate.source}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <User className="w-4 h-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Calendar className="w-4 h-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="evaluations">
            <Star className="w-4 h-4 mr-2" />
            Evaluaciones
          </TabsTrigger>
          <TabsTrigger value="references">
            <Users className="w-4 h-4 mr-2" />
            Referencias
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="w-4 h-4 mr-2" />
            Documentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información profesional */}
            <Card className="border-0.5 border-foreground rounded-[10px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Información Profesional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidate.current_position && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Posición actual</label>
                    <p className="text-sm">{candidate.current_position}</p>
                  </div>
                )}
                {candidate.current_company && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Empresa actual</label>
                    <p className="text-sm">{candidate.current_company}</p>
                  </div>
                )}
                {candidate.years_experience !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Años de experiencia</label>
                    <p className="text-sm">{candidate.years_experience} años</p>
                  </div>
                )}
                {candidate.expected_salary && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Salario esperado</label>
                    <p className="text-sm">
                      {candidate.expected_salary.toLocaleString()} {candidate.salary_currency || 'EUR'}
                    </p>
                  </div>
                )}
                {candidate.remote_work_preference && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Preferencia de trabajo remoto</label>
                    <p className="text-sm">{candidate.remote_work_preference}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <Card className="border-0.5 border-foreground rounded-[10px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Estadísticas del Proceso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{activities.length}</div>
                    <div className="text-sm text-muted-foreground">Actividades</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{evaluations.length}</div>
                    <div className="text-sm text-muted-foreground">Evaluaciones</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{references.length}</div>
                    <div className="text-sm text-muted-foreground">Referencias</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {evaluations.filter(e => e.recommendation === 'strong_yes' || e.recommendation === 'yes').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Evaluaciones positivas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Habilidades e idiomas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {candidate.skills && candidate.skills.length > 0 && (
              <Card className="border-0.5 border-foreground rounded-[10px]">
                <CardHeader>
                  <CardTitle>Habilidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {candidate.languages && candidate.languages.length > 0 && (
              <Card className="border-0.5 border-foreground rounded-[10px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="w-5 h-5" />
                    Idiomas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {candidate.languages.map((language, index) => (
                      <Badge key={index} variant="outline">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card className="border-0.5 border-foreground rounded-[10px]">
            <CardHeader>
              <CardTitle>Timeline del Proceso de Selección</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline activities={activities} isLoading={activitiesLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluations" className="mt-6">
          <Card className="border-0.5 border-foreground rounded-[10px]">
            <CardHeader>
              <CardTitle>Evaluaciones y Entrevistas</CardTitle>
            </CardHeader>
            <CardContent>
              {evaluationsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : evaluations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay evaluaciones registradas
                </p>
              ) : (
                <div className="space-y-4">
                  {evaluations.map((evaluation) => (
                    <Card key={evaluation.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">
                            {evaluation.evaluation_type} - {evaluation.position || 'Posición general'}
                          </h4>
                          <Badge variant={
                            evaluation.recommendation === 'strong_yes' || evaluation.recommendation === 'yes' 
                              ? 'default' 
                              : evaluation.recommendation === 'maybe' 
                                ? 'secondary' 
                                : 'destructive'
                          }>
                            {evaluation.recommendation}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Fecha: {new Date(evaluation.evaluation_date).toLocaleDateString()}
                        </p>
                        {evaluation.overall_score && (
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm">Puntuación general:</span>
                            <Badge variant="outline">{evaluation.overall_score}/10</Badge>
                          </div>
                        )}
                        {evaluation.cultural_fit_score && (
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm">Encaje cultural:</span>
                            <Badge variant="outline">{evaluation.cultural_fit_score}/10</Badge>
                          </div>
                        )}
                        {evaluation.notes && (
                          <p className="text-sm">{evaluation.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="references" className="mt-6">
          <Card className="border-0.5 border-foreground rounded-[10px]">
            <CardHeader>
              <CardTitle>Referencias Profesionales</CardTitle>
            </CardHeader>
            <CardContent>
              {referencesLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : references.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay referencias registradas
                </p>
              ) : (
                <div className="space-y-4">
                  {references.map((reference) => (
                    <Card key={reference.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{reference.reference_name}</h4>
                            {reference.reference_position && reference.reference_company && (
                              <p className="text-sm text-muted-foreground">
                                {reference.reference_position} en {reference.reference_company}
                              </p>
                            )}
                          </div>
                          <Badge variant={
                            reference.status === 'completed' ? 'default' : 
                            reference.status === 'contacted' ? 'secondary' : 
                            'outline'
                          }>
                            {reference.status}
                          </Badge>
                        </div>
                        {reference.overall_rating && (
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm">Valoración:</span>
                            <Badge variant="outline">{reference.overall_rating}/10</Badge>
                          </div>
                        )}
                        {reference.strengths && (
                          <p className="text-sm mb-1"><strong>Fortalezas:</strong> {reference.strengths}</p>
                        )}
                        {reference.additional_notes && (
                          <p className="text-sm text-muted-foreground">{reference.additional_notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card className="border-0.5 border-foreground rounded-[10px]">
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {candidate.cv_file_path && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-5 h-5" />
                          <span className="font-medium">Currículum Vitae</span>
                        </div>
                        <Badge variant="secondary">PDF</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>Sistema de documentos expandido en desarrollo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}