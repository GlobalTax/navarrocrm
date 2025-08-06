import { useState } from 'react'
import { User, Calendar, Star, FileText, Phone, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ActivityTimeline } from '@/components/shared/ActivityTimeline'
import { useCandidateActivities } from '@/hooks/recruitment/useCandidateActivities'
import { useCandidateEvaluations } from '@/hooks/recruitment/useCandidateEvaluations'
import { useCandidateReferences } from '@/hooks/recruitment/useCandidateReferences'

interface Candidate {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  current_position?: string
  current_company?: string
  location?: string
  years_experience?: number
  expected_salary?: number
  salary_currency?: string
  status: string
  source?: string
  skills?: string[]
  languages?: string[]
  remote_work_preference?: string
  cv_file_path?: string
}

interface CandidateFixedDataPanelProps {
  candidate: Candidate | null
}

export function CandidateFixedDataPanel({ candidate }: CandidateFixedDataPanelProps) {
  const [activeTab, setActiveTab] = useState('perfil')

  const { data: activities = [], isLoading: activitiesLoading } = useCandidateActivities(candidate?.id || '')
  const { data: evaluations = [], isLoading: evaluationsLoading } = useCandidateEvaluations(candidate?.id || '')
  const { data: references = [], isLoading: referencesLoading } = useCandidateReferences(candidate?.id || '')

  if (!candidate) {
    return (
      <Card className="border-0.5 border-foreground rounded-[10px] h-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Selecciona un candidato</p>
            <p className="text-sm text-muted-foreground">Elige un candidato de la lista para ver sus datos detallados</p>
          </div>
        </CardContent>
      </Card>
    )
  }

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
    <Card className="border-0.5 border-foreground rounded-[10px] h-full">
      <CardHeader className="border-b border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src="" />
            <AvatarFallback>
              {candidate.first_name[0]}{candidate.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">
              {candidate.first_name} {candidate.last_name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {candidate.current_position} {candidate.current_company && `en ${candidate.current_company}`}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-6 m-4 mb-0">
            <TabsTrigger value="perfil" className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span className="hidden lg:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="proceso" className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span className="hidden lg:inline">Proceso</span>
            </TabsTrigger>
            <TabsTrigger value="evaluaciones" className="flex items-center space-x-1">
              <Star className="w-4 h-4" />
              <span className="hidden lg:inline">Evaluaciones</span>
            </TabsTrigger>
            <TabsTrigger value="documentos" className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline">Documentos</span>
            </TabsTrigger>
            <TabsTrigger value="referencias" className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span className="hidden lg:inline">Referencias</span>
            </TabsTrigger>
            <TabsTrigger value="entrevistas" className="flex items-center space-x-1">
              <Phone className="w-4 h-4" />
              <span className="hidden lg:inline">Entrevistas</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-4 pt-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            <TabsContent value="perfil" className="mt-0">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Email:</span>
                      <span className="text-sm">{candidate.email}</span>
                    </div>
                    {candidate.phone && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Teléfono:</span>
                        <span className="text-sm">{candidate.phone}</span>
                      </div>
                    )}
                    {candidate.location && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Ubicación:</span>
                        <span className="text-sm">{candidate.location}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Estado:</span>
                      <Badge className={getStatusColor(candidate.status)}>
                        {candidate.status}
                      </Badge>
                    </div>
                    {candidate.source && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Fuente:</span>
                        <span className="text-sm">{candidate.source}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Información Profesional</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {candidate.current_position && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Posición actual:</span>
                        <span className="text-sm">{candidate.current_position}</span>
                      </div>
                    )}
                    {candidate.current_company && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Empresa actual:</span>
                        <span className="text-sm">{candidate.current_company}</span>
                      </div>
                    )}
                    {candidate.years_experience !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Años experiencia:</span>
                        <span className="text-sm">{candidate.years_experience}</span>
                      </div>
                    )}
                    {candidate.expected_salary && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Salario esperado:</span>
                        <span className="text-sm">
                          {candidate.expected_salary.toLocaleString()} {candidate.salary_currency || 'EUR'}
                        </span>
                      </div>
                    )}
                    {candidate.remote_work_preference && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Trabajo remoto:</span>
                        <span className="text-sm">{candidate.remote_work_preference}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {candidate.skills && candidate.skills.length > 0 && (
                  <Card>
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
                  <Card>
                    <CardHeader>
                      <CardTitle>Idiomas</CardTitle>
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

                <Card>
                  <CardHeader>
                    <CardTitle>Estadísticas del Proceso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{activities.length}</div>
                        <div className="text-sm text-muted-foreground">Actividades</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{evaluations.length}</div>
                        <div className="text-sm text-muted-foreground">Evaluaciones</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{references.length}</div>
                        <div className="text-sm text-muted-foreground">Referencias</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {evaluations.filter(e => e.recommendation === 'strong_yes' || e.recommendation === 'yes').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Positivas</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="proceso" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Timeline del Proceso de Selección</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityTimeline activities={activities} isLoading={activitiesLoading} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evaluaciones" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Evaluaciones y Entrevistas</CardTitle>
                </CardHeader>
                <CardContent>
                  {evaluationsLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-24 bg-muted rounded animate-pulse" />
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

            <TabsContent value="documentos" className="mt-0">
              <Card>
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
                    <p className="text-center text-muted-foreground py-4">
                      Sistema de documentos expandido en desarrollo
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referencias" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Referencias Profesionales</CardTitle>
                </CardHeader>
                <CardContent>
                  {referencesLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-20 bg-muted rounded animate-pulse" />
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
                              <h4 className="font-medium">{reference.reference_name}</h4>
                              <Badge variant={reference.status === 'completed' ? 'default' : 'secondary'}>
                                {reference.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 gap-2 text-sm">
                              <div>
                                <span className="font-medium">Posición:</span> {reference.reference_position}
                              </div>
                              <div>
                                <span className="font-medium">Empresa:</span> {reference.reference_company}
                              </div>
                              <div>
                                <span className="font-medium">Relación:</span> {reference.relationship}
                              </div>
                              {reference.overall_rating && (
                                <div>
                                  <span className="font-medium">Valoración:</span> {reference.overall_rating}/10
                                </div>
                              )}
                            </div>
                            {reference.additional_notes && (
                              <p className="text-sm mt-2 p-2 bg-muted/50 rounded">
                                {reference.additional_notes}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="entrevistas" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Entrevistas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    Sistema de entrevistas en desarrollo
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}