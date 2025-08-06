import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Calendar, 
  UserCheck, 
  ClipboardList,
  TrendingUp,
  Plus,
  Eye,
  BarChart3,
  List
} from 'lucide-react'
import { CandidatesTable } from './CandidatesTable'
import { RecruitmentPipeline } from './RecruitmentPipeline'
import { JobOfferBuilder } from './JobOfferBuilder'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { type Candidate, type Interview, type RecruitmentStats } from '@/types/recruitment'
import { CandidateFormDialog } from './CandidateFormDialog'
import { InterviewFormDialog } from './InterviewFormDialog'
import { CreateSampleCandidates } from './CreateSampleCandidates'
import { useCreateJobOffer } from '@/hooks/recruitment/useJobOffers'
import { InterviewsTable } from './InterviewsTable'
import { JobOffersTable } from './JobOffersTable'
import { useInterviews } from '@/hooks/recruitment/useInterviews'
import { useNavigate } from 'react-router-dom'

export function RecruitmentDashboard() {
  const { user } = useApp()
  const navigate = useNavigate()
  
  // Estados para modales
  const [candidateFormOpen, setCandidateFormOpen] = useState(false)
  const [interviewFormOpen, setInterviewFormOpen] = useState(false)
  const [jobOfferBuilderOpen, setJobOfferBuilderOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [activeView, setActiveView] = useState('overview')

  // Hook para crear ofertas de trabajo
  const createJobOfferMutation = useCreateJobOffer()

  // Hook para obtener entrevistas
  const { data: allInterviews = [], isLoading: allInterviewsLoading } = useInterviews()

  // Hook para obtener ofertas de trabajo
  const { data: jobOffers = [], isLoading: jobOffersLoading } = useQuery({
    queryKey: ['job-offers', user?.org_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_offers')
        .select(`
          *,
          candidate:candidates(id, first_name, last_name, email)
        `)
        .eq('org_id', user?.org_id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id
  })

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

  // Query para obtener departamentos
  const { data: departments = [] } = useQuery({
    queryKey: ['departments', user?.org_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .eq('org_id', user?.org_id)
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      return data
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

      if (processesError) {
        console.warn('Recruitment processes not available:', processesError)
      }

      const { data: interviewsData, error: interviewsError } = await supabase
        .from('interviews')
        .select('scheduled_at, status')
        .eq('org_id', user?.org_id)
        .gte('scheduled_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      if (interviewsError) {
        console.warn('Interviews not available:', interviewsError)
      }

      // Calcular estadísticas
      const totalCandidates = candidatesData?.length || 0
      const activeProcesses = processesData?.filter(p => p.status === 'active').length || 0
      const interviewsThisWeek = interviewsData?.length || 0
      const offersPending = candidatesData?.filter(c => c.status === 'offer_sent').length || 0
      const hiredThisMonth = candidatesData?.filter(c => 
        c.status === 'hired' && 
        new Date(c.created_at) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      ).length || 0

      // Agrupar por estado
      const byStatus = candidatesData?.reduce((acc, candidate) => {
        acc[candidate.status] = (acc[candidate.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Agrupar por fuente
      const bySource = candidatesData?.reduce((acc, candidate) => {
        acc[candidate.source] = (acc[candidate.source] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Agrupar por etapa
      const byStage = processesData?.reduce((acc, process) => {
        acc[process.current_stage] = (acc[process.current_stage] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

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
    setJobOfferBuilderOpen(true)
  }

  const handleJobOfferSubmit = (data: any) => {
    createJobOfferMutation.mutate(data, {
      onSuccess: () => {
        setJobOfferBuilderOpen(false)
        setSelectedCandidate(null)
      }
    })
  }

  const handleAddCandidate = () => {
    setSelectedCandidate(null)
    setCandidateFormOpen(true)
  }

  const handleEditCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setCandidateFormOpen(true)
  }

  const handleViewCandidate = (candidate: Candidate) => {
    navigate(`/recruitment/candidates/${candidate.id}`)
  }

  const handleViewInterview = (interview: any) => {
    navigate(`/recruitment/interviews/${interview.id}`)
  }

  const handleViewJobOffer = (offer: any) => {
    navigate(`/recruitment/job-offers/${offer.id}`)
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

      {/* Navegación de vistas */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="rounded-[10px]">
            <List className="w-4 h-4 mr-2" />
            Vista General
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="rounded-[10px]">
            <BarChart3 className="w-4 h-4 mr-2" />
            Pipeline Visual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Tabs defaultValue="candidates" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="candidates">Candidatos</TabsTrigger>
              <TabsTrigger value="interviews">Entrevistas</TabsTrigger>
              <TabsTrigger value="offers">Ofertas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="candidates" className="mt-6">
              <CandidatesTable
                candidates={candidates}
                isLoading={candidatesLoading}
                onViewCandidate={handleViewCandidate}
                onScheduleInterview={handleScheduleInterview}
                onCreateOffer={handleCreateOffer}
                onAddCandidate={handleAddCandidate}
              />
            </TabsContent>
            
            <TabsContent value="interviews" className="mt-6">
              <InterviewsTable
                interviews={allInterviews}
                isLoading={allInterviewsLoading}
                onScheduleInterview={() => setInterviewFormOpen(true)}
                onViewInterview={handleViewInterview}
                onEditInterview={() => {}}
                onDeleteInterview={() => {}}
              />
            </TabsContent>
            
            <TabsContent value="offers" className="mt-6">
              <JobOffersTable
                jobOffers={jobOffers}
                isLoading={jobOffersLoading}
                onCreateOffer={() => setJobOfferBuilderOpen(true)}
                onViewOffer={handleViewJobOffer}
                onEditOffer={() => {}}
                onSendOffer={() => {}}
                onDeleteOffer={() => {}}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6 mt-6">
          <RecruitmentPipeline
            onSelectCandidate={handleSelectCandidate}
            onScheduleInterview={handleScheduleInterview}
            onCreateOffer={handleCreateOffer}
          />
        </TabsContent>
      </Tabs>

      {/* Perfiles de prueba - solo mostrar si no hay candidatos */}
      {stats?.total_candidates === 0 && (
        <CreateSampleCandidates />
      )}

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

      <JobOfferBuilder
        open={jobOfferBuilderOpen}
        onClose={() => setJobOfferBuilderOpen(false)}
        candidate={selectedCandidate}
        candidates={candidates}
        departments={departments}
        onSubmit={handleJobOfferSubmit}
        isLoading={createJobOfferMutation.isPending}
      />
    </div>
  )
}