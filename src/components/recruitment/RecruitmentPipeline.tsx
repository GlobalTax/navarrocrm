import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  User, 
  Calendar, 
  Clock,
  ArrowRight,
  Eye,
  UserPlus,
  MessageCircle,
  FileText,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { type Candidate } from '@/types/recruitment'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

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
  const [selectedStage, setSelectedStage] = useState<string | null>(null)

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
    }
  }

  const getCandidateInitials = (candidate: Candidate) => {
    return `${candidate.first_name[0]}${candidate.last_name[0]}`.toUpperCase()
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const createdAt = new Date(date)
    const diffInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Hoy'
    if (diffInDays === 1) return 'Ayer'
    if (diffInDays < 7) return `${diffInDays}d`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}sem`
    return `${Math.floor(diffInDays / 30)}m`
  }

  if (isLoading) {
    return (
      <Card className="border-0.5 border-foreground rounded-[10px]">
        <CardContent className="p-6">
          <div className="text-center">Cargando pipeline...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas del Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{pipelineStats?.total || 0}</div>
            <div className="text-sm text-muted-foreground">Total Candidatos</div>
          </CardContent>
        </Card>
        
        <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{pipelineStats?.thisMonth || 0}</div>
            <div className="text-sm text-muted-foreground">Este Mes</div>
          </CardContent>
        </Card>
        
        <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {pipelineStats?.conversionRate.toFixed(1) || 0}%
            </div>
            <div className="text-sm text-muted-foreground">Tasa Conversión</div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Visual */}
      <Card className="border-0.5 border-foreground rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Pipeline de Reclutamiento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {PIPELINE_STAGES.map((stage, index) => {
              const candidates = candidatesByStage[stage.id] || []
              const Icon = stage.icon
              
              return (
                <div key={stage.id} className="space-y-4">
                  {/* Header de la etapa */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <h3 className="font-medium text-sm">{stage.title}</h3>
                      </div>
                      <Badge variant="outline" className="rounded-[10px] border-0.5 border-foreground">
                        {candidates.length}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{stage.description}</p>
                  </div>

                  {/* Lista de candidatos */}
                  <div className="space-y-2 min-h-[400px] max-h-[500px] overflow-y-auto">
                    {candidates.map((candidate) => (
                      <Card 
                        key={candidate.id} 
                        className={cn(
                          "border-0.5 border-foreground rounded-[10px] p-3 cursor-pointer",
                          "hover:shadow-md hover:-translate-y-1 transition-all duration-200",
                          stage.color
                        )}
                        onClick={() => handleCandidateAction(candidate, 'view')}
                      >
                        <div className="space-y-3">
                          {/* Avatar y nombre */}
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs font-medium">
                                {getCandidateInitials(candidate)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {candidate.first_name} {candidate.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {candidate.email}
                              </p>
                            </div>
                          </div>

                          {/* Información adicional */}
                          <div className="space-y-1">
                            {candidate.current_position && (
                              <p className="text-xs text-muted-foreground truncate">
                                {candidate.current_position}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{getTimeAgo(candidate.created_at)}</span>
                              </span>
                              {candidate.years_experience && (
                                <span>{candidate.years_experience}a exp.</span>
                              )}
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-1">
                              {stage.id === 'screening' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 px-2 text-xs rounded-[10px] border-0.5 border-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCandidateAction(candidate, 'interview')
                                  }}
                                >
                                  <Calendar className="w-3 h-3" />
                                </Button>
                              )}
                              {stage.id === 'interviewing' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 px-2 text-xs rounded-[10px] border-0.5 border-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCandidateAction(candidate, 'offer')
                                  }}
                                >
                                  <FileText className="w-3 h-3" />
                                </Button>
                              )}
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-[10px] border-0.5 border-foreground">
                                <DropdownMenuItem onClick={() => handleCandidateAction(candidate, 'view')}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCandidateAction(candidate, 'interview')}>
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Programar Entrevista
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCandidateAction(candidate, 'offer')}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Crear Oferta
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </Card>
                    ))}

                    {candidates.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Sin candidatos</p>
                      </div>
                    )}
                  </div>

                  {/* Flecha hacia la siguiente etapa */}
                  {index < PIPELINE_STAGES.length - 1 && (
                    <div className="hidden lg:flex justify-center items-center h-full absolute right-0 top-0">
                      <ArrowRight className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}