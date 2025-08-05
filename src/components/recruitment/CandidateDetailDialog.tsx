import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  User,
  Building,
  Globe,
  Edit,
  MessageSquare,
  Clock
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { type Candidate, type Interview, CANDIDATE_STATUS_LABELS, INTERVIEW_TYPE_LABELS } from '@/types/recruitment'

interface CandidateDetailDialogProps {
  open: boolean
  onClose: () => void
  candidate: Candidate | null
  onEdit?: (candidate: Candidate) => void
  onScheduleInterview?: (candidate: Candidate) => void
}

export function CandidateDetailDialog({ 
  open, 
  onClose, 
  candidate,
  onEdit,
  onScheduleInterview 
}: CandidateDetailDialogProps) {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [newStatus, setNewStatus] = useState<string>('')

  // Query para obtener entrevistas del candidato
  const { data: interviews = [], isLoading: interviewsLoading } = useQuery({
    queryKey: ['candidate-interviews', candidate?.id],
    queryFn: async () => {
      if (!candidate?.id) return []
      
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          interviewer:users!interviews_interviewer_id_fkey(first_name, last_name, email)
        `)
        .eq('candidate_id', candidate.id)
        .order('scheduled_at', { ascending: false })
      
      if (error) throw error
      return data as (Interview & { interviewer: any })[]
    },
    enabled: !!candidate?.id
  })

  // Query para obtener procesos de reclutamiento
  const { data: processes = [], isLoading: processesLoading } = useQuery({
    queryKey: ['candidate-processes', candidate?.id],
    queryFn: async () => {
      if (!candidate?.id) return []
      
      const { data, error } = await supabase
        .from('recruitment_processes')
        .select(`
          *,
          hiring_manager:users!recruitment_processes_hiring_manager_id_fkey(first_name, last_name),
          recruiter:users!recruitment_processes_recruiter_id_fkey(first_name, last_name)
        `)
        .eq('candidate_id', candidate.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!candidate?.id
  })

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      if (!candidate) return
      
      const { error } = await supabase
        .from('candidates')
        .update({ status })
        .eq('id', candidate.id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['recruitment-stats'] })
      toast.success('Estado actualizado correctamente')
    },
    onError: (error) => {
      toast.error('No se pudo actualizar el estado')
      console.error(error)
    }
  })

  const handleStatusChange = (status: string) => {
    updateStatusMutation.mutate(status)
  }

  if (!candidate) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[10px] border-0.5 border-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              {candidate.first_name} {candidate.last_name}
              <Badge 
                variant={candidate.status === 'hired' ? 'default' : 'secondary'} 
                className="ml-3 rounded-[10px] border-0.5"
              >
                {CANDIDATE_STATUS_LABELS[candidate.status as keyof typeof CANDIDATE_STATUS_LABELS]}
              </Badge>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(candidate)} className="rounded-[10px] border-0.5 border-foreground">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
              {onScheduleInterview && (
                <Button variant="outline" size="sm" onClick={() => onScheduleInterview(candidate)} className="rounded-[10px] border-0.5 border-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  Programar Entrevista
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información de contacto */}
            <Card className="border-0.5 border-foreground rounded-[10px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{candidate.email}</span>
                </div>
                
                {candidate.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{candidate.phone}</span>
                  </div>
                )}
                
                {candidate.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{candidate.location}</span>
                  </div>
                )}
                
                {candidate.linkedin_url && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      LinkedIn
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información profesional */}
            <Card className="border-0.5 border-foreground rounded-[10px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Información Profesional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidate.current_position && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Posición Actual:</span>
                    <p>{candidate.current_position}</p>
                  </div>
                )}
                
                {candidate.current_company && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Empresa Actual:</span>
                    <p>{candidate.current_company}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Años de Experiencia:</span>
                  <p>{candidate.years_experience || 0} años</p>
                </div>
                
                {candidate.expected_salary && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Salario Esperado:</span>
                    <p>{candidate.expected_salary.toLocaleString()} {candidate.salary_currency}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Preferencia de Trabajo:</span>
                  <p>
                    {candidate.remote_work_preference === 'onsite' ? 'Presencial' :
                     candidate.remote_work_preference === 'remote' ? 'Remoto' : 'Híbrido'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Habilidades e idiomas */}
            <Card className="border-0.5 border-foreground rounded-[10px]">
              <CardHeader>
                <CardTitle>Habilidades e Idiomas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidate.skills && candidate.skills.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground mb-2 block">Habilidades:</span>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="rounded-[10px] border-0.5">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {candidate.languages && candidate.languages.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground mb-2 block">Idiomas:</span>
                    <div className="flex flex-wrap gap-2">
                      {candidate.languages.map((language) => (
                        <Badge key={language} variant="outline" className="rounded-[10px] border-0.5">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notas */}
            {(candidate.cover_letter || candidate.notes) && (
              <Card className="border-0.5 border-foreground rounded-[10px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Notas y Comentarios
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.cover_letter && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground mb-2 block">Carta de Presentación:</span>
                      <p className="text-sm bg-muted p-3 rounded-[10px]">{candidate.cover_letter}</p>
                    </div>
                  )}
                  
                  {candidate.notes && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground mb-2 block">Notas Internas:</span>
                      <p className="text-sm bg-muted p-3 rounded-[10px]">{candidate.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Entrevistas */}
            <Card className="border-0.5 border-foreground rounded-[10px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Historial de Entrevistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {interviewsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-muted rounded-[10px]" />
                      </div>
                    ))}
                  </div>
                ) : interviews.length > 0 ? (
                  <div className="space-y-3">
                    {interviews.map((interview) => (
                      <div key={interview.id} className="p-3 border border-border rounded-[10px]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="rounded-[10px] border-0.5">
                              {INTERVIEW_TYPE_LABELS[interview.interview_type]}
                            </Badge>
                            <Badge 
                              variant={interview.status === 'completed' ? 'default' : 'secondary'}
                              className="rounded-[10px] border-0.5"
                            >
                              {interview.status === 'completed' ? 'Completada' :
                               interview.status === 'scheduled' ? 'Programada' :
                               interview.status === 'cancelled' ? 'Cancelada' : 'No asistió'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {new Date(interview.scheduled_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        
                        {interview.interviewer && (
                          <p className="text-sm text-muted-foreground">
                            Entrevistador: {interview.interviewer.first_name} {interview.interviewer.last_name}
                          </p>
                        )}
                        
                        {interview.evaluation_notes && (
                          <p className="text-sm mt-2 bg-muted p-2 rounded">
                            {interview.evaluation_notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay entrevistas registradas
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Cambiar estado */}
            <Card className="border-0.5 border-foreground rounded-[10px]">
              <CardHeader>
                <CardTitle>Estado del Candidato</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={candidate.status}
                  onValueChange={handleStatusChange}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="rounded-[10px] border-0.5 border-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CANDIDATE_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card className="border-0.5 border-foreground rounded-[10px]">
              <CardHeader>
                <CardTitle>Información Adicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Fuente:</span>
                  <p className="text-sm">
                    {candidate.source === 'manual' ? 'Manual' :
                     candidate.source === 'linkedin' ? 'LinkedIn' :
                     candidate.source === 'job_board' ? 'Portal de Empleo' :
                     candidate.source === 'referral' ? 'Referencia' : 'Sitio Web'}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Fecha de Registro:</span>
                  <p className="text-sm">
                    {new Date(candidate.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                
                {candidate.availability_date && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Disponibilidad:</span>
                    <p className="text-sm">
                      {new Date(candidate.availability_date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Procesos activos */}
            {processes.length > 0 && (
              <Card className="border-0.5 border-foreground rounded-[10px]">
                <CardHeader>
                  <CardTitle>Procesos de Reclutamiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {processes.map((process) => (
                      <div key={process.id} className="p-3 border border-border rounded-[10px]">
                        <h4 className="font-medium text-sm">{process.position_title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs rounded-[10px] border-0.5">
                            {process.status === 'active' ? 'Activo' :
                             process.status === 'on_hold' ? 'En pausa' :
                             process.status === 'completed' ? 'Completado' : 'Cancelado'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs rounded-[10px] border-0.5">
                            {process.current_stage}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}