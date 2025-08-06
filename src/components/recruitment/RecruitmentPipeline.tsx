import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  UserPlus,
  MessageCircle,
  FileText,
  CheckCircle,
  XCircle,
  BarChart3,
  Settings,
  Filter,
  Search,
  Download,
  RefreshCw,
  Eye
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { type Candidate } from '@/types/recruitment'
import { PipelineStageColumn } from './PipelineStageColumn'
import { PipelineMetrics } from './PipelineMetrics'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const PIPELINE_STAGES = [
  {
    id: 'new',
    title: 'Nuevos',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: UserPlus,
    description: 'Candidatos recién añadidos'
  },
  {
    id: 'screening',
    title: 'Evaluación',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Eye,
    description: 'En proceso de evaluación inicial'
  },
  {
    id: 'interviewing',
    title: 'Entrevistas',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: MessageCircle,
    description: 'En proceso de entrevistas'
  },
  {
    id: 'offer_sent',
    title: 'Oferta Enviada',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: FileText,
    description: 'Oferta de trabajo enviada'
  },
  {
    id: 'hired',
    title: 'Contratados',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Proceso completado exitosamente'
  },
  {
    id: 'rejected',
    title: 'Rechazados',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    description: 'Candidatos descartados'
  }
]

interface RecruitmentPipelineProps {
  onSelectCandidate?: (candidate: Candidate) => void
  onScheduleInterview?: (candidate: Candidate) => void
  onCreateOffer?: (candidate: Candidate) => void
}

export function RecruitmentPipeline({ 
  onSelectCandidate, 
  onScheduleInterview, 
  onCreateOffer 
}: RecruitmentPipelineProps) {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeView, setActiveView] = useState('pipeline')
  const [stageFilter, setStageFilter] = useState<string[]>([])
  const [showMetrics, setShowMetrics] = useState(true)

  // Query para obtener candidatos agrupados por estado
  const { data: candidatesByStage = {}, isLoading } = useQuery({
    queryKey: ['candidates-pipeline', user?.org_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('org_id', user?.org_id)
        .order('created_at', { ascending: false })
      
      if (error) throw error

      // Agrupar candidatos por estado
      const grouped = (data as Candidate[]).reduce((acc, candidate) => {
        const stage = candidate.status || 'new'
        if (!acc[stage]) acc[stage] = []
        acc[stage].push(candidate)
        return acc
      }, {} as Record<string, Candidate[]>)

      return grouped
    },
    enabled: !!user?.org_id
  })

  // Query para obtener estadísticas del pipeline
  const { data: pipelineStats } = useQuery({
    queryKey: ['pipeline-stats', user?.org_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('status, created_at')
        .eq('org_id', user?.org_id)
      
      if (error) throw error

      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)

      const stats = data.reduce((acc, candidate) => {
        acc.total++
        if (new Date(candidate.created_at) >= thisMonth) {
          acc.thisMonth++
        }
        
        const conversionRate = data.filter(c => c.status === 'hired').length / data.length * 100
        acc.conversionRate = conversionRate || 0
        
        return acc
      }, { total: 0, thisMonth: 0, conversionRate: 0 })

      return stats
    },
    enabled: !!user?.org_id
  })

  // Mutation para actualizar estado de candidato (drag & drop)
  const updateCandidateStatus = useMutation({
    mutationFn: async ({ candidateId, newStatus }: { candidateId: string, newStatus: string }) => {
      const { error } = await supabase
        .from('candidates')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', candidateId)
        .eq('org_id', user?.org_id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates-pipeline'] })
      queryClient.invalidateQueries({ queryKey: ['recruitment-stats'] })
      toast.success('Candidato movido correctamente')
    },
    onError: (error) => {
      console.error('Error updating candidate:', error)
      toast.error('Error al mover el candidato')
    }
  })

  // Manejar drag & drop
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    
    if (!destination) return
    if (destination.droppableId === source.droppableId) return
    
    updateCandidateStatus.mutate({
      candidateId: draggableId,
      newStatus: destination.droppableId
    })
  }

  // Filtrar candidatos por búsqueda
  const filteredCandidatesByStage = Object.entries(candidatesByStage).reduce(
    (acc, [stage, candidates]) => {
      const filtered = candidates.filter(candidate => {
        const searchMatch = searchTerm === '' || 
          `${candidate.first_name} ${candidate.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (candidate.current_position || '').toLowerCase().includes(searchTerm.toLowerCase())
        
        const stageMatch = stageFilter.length === 0 || stageFilter.includes(stage)
        
        return searchMatch && stageMatch
      })
      
      acc[stage] = filtered
      return acc
    },
    {} as Record<string, Candidate[]>
  )

  // Calcular métricas avanzadas
  const calculateMetrics = () => {
    const allCandidates = Object.values(candidatesByStage).flat()
    const totalCandidates = allCandidates.length
    const activeThisWeek = allCandidates.filter(c => 
      new Date(c.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length

    // Calcular métricas por etapa
    const stageMetrics = PIPELINE_STAGES.reduce((acc, stage) => {
      const stageCandidates = candidatesByStage[stage.id] || []
      const avgDays = stageCandidates.length > 0 
        ? stageCandidates.reduce((sum, c) => {
            const days = Math.floor((Date.now() - new Date(c.updated_at || c.created_at).getTime()) / (24 * 60 * 60 * 1000))
            return sum + days
          }, 0) / stageCandidates.length 
        : 0

      acc[stage.id] = {
        count: stageCandidates.length,
        avgDays: Math.round(avgDays),
        conversionRate: Math.round(Math.random() * 30 + 60), // Simulado
        trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down'
      }
      return acc
    }, {} as Record<string, any>)

    // Detectar cuellos de botella (etapas con > 7 días promedio y > 3 candidatos)
    const bottlenecks = Object.entries(stageMetrics)
      .filter(([_, metrics]: [string, any]) => metrics.avgDays > 7 && metrics.count > 3)
      .map(([stage, _]) => stage)

    return {
      totalCandidates,
      activeThisWeek,
      avgTimeToHire: 28, // Simulado
      conversionRate: Math.round((candidatesByStage['hired']?.length || 0) / totalCandidates * 100) || 0,
      bottlenecks,
      stageMetrics,
      predictions: {
        expectedHires: Math.ceil(totalCandidates * 0.15),
        timeToNextHire: Math.round(Math.random() * 14 + 7),
        topBottleneck: bottlenecks[0] || 'interviewing'
      }
    }
  }

  const metrics = calculateMetrics()

  const handleCandidateAction = (candidate: Candidate, action: string) => {
    switch (action) {
      case 'view':
        onSelectCandidate?.(candidate)
        break
      case 'interview':
        onScheduleInterview?.(candidate)
        break
      case 'offer':
        onCreateOffer?.(candidate)
        break
      case 'assign':
        // Lógica para asignar responsable
        toast.info('Funcionalidad de asignación próximamente')
        break
    }
  }

  if (isLoading) {
    return (
      <Card className="border-0.5 border-foreground rounded-[10px]">
        <CardContent className="p-6">
          <div className="text-center flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Cargando pipeline...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controles superiores */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar candidatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 rounded-[10px] border-0.5 border-foreground"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMetrics(!showMetrics)}
            className="rounded-[10px] border-0.5 border-foreground"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {showMetrics ? 'Ocultar' : 'Mostrar'} Métricas
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-[10px] border-0.5 border-foreground"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-[10px] border-0.5 border-foreground"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-[10px] border-0.5 border-foreground"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Métricas avanzadas */}
      {showMetrics && (
        <PipelineMetrics metrics={metrics} />
      )}

      {/* Navegación de vistas */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pipeline" className="rounded-[10px]">
            <User className="w-4 h-4 mr-2" />
            Pipeline Visual
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-[10px]">
            <BarChart3 className="w-4 h-4 mr-2" />
            Vista Analítica
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-6">
          {/* Pipeline con Drag & Drop */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Card className="border-0.5 border-foreground rounded-[10px]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Pipeline de Reclutamiento</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>Total: {Object.values(filteredCandidatesByStage).flat().length}</span>
                    {updateCandidateStatus.isPending && (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                  {PIPELINE_STAGES.map((stage, index) => {
                    const candidates = filteredCandidatesByStage[stage.id] || []
                    const stageMetrics = metrics.stageMetrics[stage.id]
                    
                    return (
                      <PipelineStageColumn
                        key={stage.id}
                        stage={stage}
                        candidates={candidates}
                        onCandidateAction={handleCandidateAction}
                        stageMetrics={stageMetrics ? {
                          averageDaysInStage: stageMetrics.avgDays,
                          conversionRate: stageMetrics.conversionRate,
                          bottleneck: metrics.bottlenecks.includes(stage.id)
                        } : undefined}
                      />
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </DragDropContext>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          {/* Vista analítica detallada */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0.5 border-foreground rounded-[10px]">
              <CardHeader>
                <CardTitle>Embudo de Conversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {PIPELINE_STAGES.map((stage) => {
                    const candidates = candidatesByStage[stage.id] || []
                    const percentage = metrics.totalCandidates > 0 
                      ? (candidates.length / metrics.totalCandidates * 100).toFixed(1)
                      : '0'
                    
                    return (
                      <div key={stage.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{stage.title}</span>
                          <span>{candidates.length} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0.5 border-foreground rounded-[10px]">
              <CardHeader>
                <CardTitle>Tiempo por Etapa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {PIPELINE_STAGES.map((stage) => {
                    const stageMetrics = metrics.stageMetrics[stage.id]
                    
                    return (
                      <div key={stage.id} className="flex justify-between items-center p-3 border rounded-[10px] border-0.5 border-foreground">
                        <div className="flex items-center space-x-3">
                          <stage.icon className="w-4 h-4" />
                          <span className="text-sm font-medium capitalize">{stage.title}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{stageMetrics?.avgDays || 0}d</div>
                          <div className="text-xs text-muted-foreground">promedio</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}