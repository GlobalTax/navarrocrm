import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  Calendar, 
  UserCheck, 
  ClipboardList,
  TrendingUp,
  Plus,
  Eye
} from 'lucide-react'
import { CandidateCompactList } from './CandidateCompactList'
import { CandidateFixedDataPanel } from './CandidateFixedDataPanel'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { type Candidate, type Interview, type RecruitmentStats } from '@/types/recruitment'
import { CandidateFormDialog } from './CandidateFormDialog'
import { InterviewFormDialog } from './InterviewFormDialog'
import { JobOfferFormDialog } from './JobOfferFormDialog'
import { CreateSampleCandidates } from './CreateSampleCandidates'

export function RecruitmentDashboard() {
  const { user } = useApp()
  
  // Estados para modales
  const [candidateFormOpen, setCandidateFormOpen] = useState(false)
  const [interviewFormOpen, setInterviewFormOpen] = useState(false)
  const [jobOfferFormOpen, setJobOfferFormOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  // Query para obtener candidatos
  const { data: candidates = [], isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidates', user?.org_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('org_id', user?.org_id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Candidate[]
    },
    enabled: !!user?.org_id
  })

  // Query para obtener entrevistas próximas
  const { data: upcomingInterviews = [], isLoading: interviewsLoading } = useQuery({
    queryKey: ['upcoming-interviews', user?.org_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          candidate:candidates(first_name, last_name, email)
        `)
        .eq('org_id', user?.org_id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5)
      
      if (error) throw error
      return data as (Interview & { candidate: any })[]
    },
    enabled: !!user?.org_id
  })

  // Query para estadísticas
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['recruitment-stats', user?.org_id],
    queryFn: async () => {
      // Obtener estadísticas básicas
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('status, source, created_at')
        .eq('org_id', user?.org_id)

      if (candidatesError) throw candidatesError

      const { data: processesData, error: processesError } = await supabase
        .from('recruitment_processes')
        .select('status, current_stage')
        .eq('org_id', user?.org_id)

      if (processesError) throw processesError

      const { data: interviewsData, error: interviewsError } = await supabase
        .from('interviews')
        .select('scheduled_at, status')
        .eq('org_id', user?.org_id)
        .gte('scheduled_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      if (interviewsError) throw interviewsError

      // Calcular estadísticas
      const totalCandidates = candidatesData.length
      const activeProcesses = processesData.filter(p => p.status === 'active').length
      const interviewsThisWeek = interviewsData.length
      const offersPending = candidatesData.filter(c => c.status === 'offer_sent').length
      const hiredThisMonth = candidatesData.filter(c => 
        c.status === 'hired' && 
        new Date(c.created_at) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      ).length

      // Agrupar por estado
      const byStatus = candidatesData.reduce((acc, candidate) => {
        acc[candidate.status] = (acc[candidate.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Agrupar por fuente
      const bySource = candidatesData.reduce((acc, candidate) => {
        acc[candidate.source] = (acc[candidate.source] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Agrupar por etapa
      const byStage = processesData.reduce((acc, process) => {
        acc[process.current_stage] = (acc[process.current_stage] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        total_candidates: totalCandidates,
        active_processes: activeProcesses,
        interviews_this_week: interviewsThisWeek,
        offers_pending: offersPending,
        hired_this_month: hiredThisMonth,
        by_status: byStatus,
        by_source: bySource,
        by_stage: byStage
      } as RecruitmentStats
    },
    enabled: !!user?.org_id
  })

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
  }

  const handleScheduleInterview = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setInterviewFormOpen(true)
  }

  const handleCreateOffer = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setJobOfferFormOpen(true)
  }

  const handleAddCandidate = () => {
    setSelectedCandidate(null)
    setCandidateFormOpen(true)
  }

  const handleEditCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setCandidateFormOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Candidatos</p>
                <p className="text-2xl font-bold">{stats?.total_candidates || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <ClipboardList className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Procesos Activos</p>
                <p className="text-2xl font-bold">{stats?.active_processes || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entrevistas (7d)</p>
                <p className="text-2xl font-bold">{stats?.interviews_this_week || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ofertas Pendientes</p>
                <p className="text-2xl font-bold">{stats?.offers_pending || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contratados (mes)</p>
                <p className="text-2xl font-bold">{stats?.hired_this_month || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layout principal de dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Panel izquierdo: Lista compacta de candidatos (40%) */}
        <div className="lg:col-span-2 h-[600px]">
          <CandidateCompactList
            candidates={candidates}
            isLoading={candidatesLoading}
            selectedCandidate={selectedCandidate}
            onSelectCandidate={handleSelectCandidate}
            onScheduleInterview={handleScheduleInterview}
            onCreateOffer={handleCreateOffer}
            onAddCandidate={handleAddCandidate}
          />
        </div>

        {/* Panel derecho: Datos detallados del candidato (60%) */}
        <div className="lg:col-span-3 h-[600px]">
          <CandidateFixedDataPanel candidate={selectedCandidate} />
        </div>
      </div>

      {/* Panel lateral inferior con entrevistas próximas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Próximas Entrevistas
              <Button variant="outline" size="sm" className="rounded-[10px] border-0.5 border-foreground">
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {interviewsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded-[10px]" />
                  </div>
                ))}
              </div>
            ) : upcomingInterviews.length > 0 ? (
              <div className="space-y-3">
                {upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="p-3 border border-border rounded-[10px] hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {interview.candidate?.first_name} {interview.candidate?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(interview.scheduled_at).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <Badge variant="outline" className="rounded-[10px] border-0.5">
                        {interview.interview_type === 'technical' ? 'Técnica' :
                         interview.interview_type === 'cultural' ? 'Cultural' :
                         interview.interview_type === 'management' ? 'Gerencial' : 'RH'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay entrevistas programadas
              </p>
            )}
          </CardContent>
        </Card>

        {/* Resumen por estado */}
        <div className="space-y-6">
          {stats && (
            <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle>Estado de Candidatos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.by_status).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm">
                        {status === 'new' ? 'Nuevos' :
                         status === 'screening' ? 'En evaluación' :
                         status === 'interviewing' ? 'En entrevistas' :
                         status === 'offer_sent' ? 'Oferta enviada' :
                         status === 'hired' ? 'Contratados' :
                         status === 'rejected' ? 'Rechazados' : 'Se retiraron'}
                      </span>
                      <Badge variant="outline" className="rounded-[10px] border-0.5">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Perfiles de prueba - solo mostrar si no hay candidatos */}
          {stats?.total_candidates === 0 && (
            <CreateSampleCandidates />
          )}
        </div>
      </div>

      {/* Modales */}
      <CandidateFormDialog
        open={candidateFormOpen}
        onClose={() => setCandidateFormOpen(false)}
        candidate={selectedCandidate}
      />


      <InterviewFormDialog
        open={interviewFormOpen}
        onClose={() => setInterviewFormOpen(false)}
        candidate={selectedCandidate}
      />

      <JobOfferFormDialog
        open={jobOfferFormOpen}
        onClose={() => setJobOfferFormOpen(false)}
        candidate={selectedCandidate}
      />
    </div>
  )
}