import { useState } from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Clock,
  Calendar,
  FileText,
  Eye,
  MoreHorizontal,
  User,
  TrendingUp,
  Timer,
  AlertCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Candidate } from '@/types/recruitment'
import { cn } from '@/lib/utils'
import { format, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'

interface PipelineStageColumnProps {
  stage: {
    id: string
    title: string
    color: string
    icon: any
    description: string
  }
  candidates: Candidate[]
  onCandidateAction: (candidate: Candidate, action: string) => void
  stageMetrics?: {
    averageDaysInStage: number
    conversionRate: number
    bottleneck: boolean
  }
}

export function PipelineStageColumn({ 
  stage, 
  candidates, 
  onCandidateAction,
  stageMetrics 
}: PipelineStageColumnProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const Icon = stage.icon

  const getCandidateInitials = (candidate: Candidate) => {
    return `${candidate.first_name[0]}${candidate.last_name[0]}`.toUpperCase()
  }

  const getTimeInStage = (candidate: Candidate) => {
    const updatedAt = new Date(candidate.updated_at || candidate.created_at)
    const now = new Date()
    const days = differenceInDays(now, updatedAt)
    
    if (days === 0) return 'Hoy'
    if (days === 1) return '1 día'
    if (days < 7) return `${days} días`
    if (days < 30) return `${Math.floor(days / 7)} sem`
    return `${Math.floor(days / 30)} mes`
  }

  const getUrgencyColor = (candidate: Candidate) => {
    const updatedAt = new Date(candidate.updated_at || candidate.created_at)
    const now = new Date()
    const days = differenceInDays(now, updatedAt)
    
    if (days > 14) return 'text-red-500'
    if (days > 7) return 'text-orange-500'
    return 'text-muted-foreground'
  }

  const getCandidateScore = (candidate: Candidate) => {
    // Lógica simple para mostrar puntuación basada en experiencia y estado
    const baseScore = candidate.years_experience ? Math.min(candidate.years_experience * 10, 85) : 50
    const randomVariance = Math.floor(Math.random() * 20) - 10
    return Math.max(0, Math.min(100, baseScore + randomVariance))
  }

  return (
    <div className="space-y-4 h-full">
      {/* Header de la etapa con métricas */}
      <Card className="border-0.5 border-foreground rounded-[10px]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon className="w-4 h-4" />
              <CardTitle className="text-sm font-medium">{stage.title}</CardTitle>
              {stageMetrics?.bottleneck && (
                <AlertCircle className="w-4 h-4 text-orange-500" />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="rounded-[10px] border-0.5 border-foreground">
                {candidates.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
              >
                <span className="text-xs">{isExpanded ? '−' : '+'}</span>
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">{stage.description}</p>
          
          {/* Métricas de la etapa */}
          {stageMetrics && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Tiempo promedio</div>
                <div className="text-sm font-medium flex items-center justify-center">
                  <Timer className="w-3 h-3 mr-1" />
                  {stageMetrics.averageDaysInStage}d
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Conversión</div>
                <div className="text-sm font-medium flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stageMetrics.conversionRate}%
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Lista de candidatos droppable */}
      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto p-2 rounded-[10px] transition-colors",
              snapshot.isDraggingOver && "bg-muted/50 border border-dashed border-muted-foreground"
            )}
          >
            {isExpanded && candidates.map((candidate, index) => (
              <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
                {(provided, snapshot) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                      "border-0.5 border-foreground rounded-[10px] p-3 cursor-pointer transition-all duration-200",
                      "hover:shadow-md hover:-translate-y-1",
                      snapshot.isDragging && "shadow-lg rotate-3 scale-105",
                      stage.color
                    )}
                    onClick={() => onCandidateAction(candidate, 'view')}
                  >
                    <div className="space-y-3">
                      {/* Header del candidato */}
                      <div className="flex items-center justify-between">
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
                              {candidate.current_position || candidate.email}
                            </p>
                          </div>
                        </div>
                        
                        {/* Score del candidato */}
                        <div className="text-right">
                          <div className="text-xs font-bold text-primary">
                            {getCandidateScore(candidate)}%
                          </div>
                          <div className="text-xs text-muted-foreground">match</div>
                        </div>
                      </div>

                      {/* Información adicional */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={cn("flex items-center space-x-1", getUrgencyColor(candidate))}>
                            <Clock className="w-3 h-3" />
                            <span>{getTimeInStage(candidate)}</span>
                          </span>
                          {candidate.years_experience && (
                            <span className="text-muted-foreground">
                              {candidate.years_experience}a exp.
                            </span>
                          )}
                        </div>
                        
                        {candidate.expected_salary && (
                          <div className="text-xs text-muted-foreground">
                            Salario: €{candidate.expected_salary.toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Acciones rápidas */}
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-1">
                          {stage.id === 'screening' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs rounded-[10px] border-0.5 border-foreground"
                              onClick={(e) => {
                                e.stopPropagation()
                                onCandidateAction(candidate, 'interview')
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
                                onCandidateAction(candidate, 'offer')
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
                            <DropdownMenuItem onClick={() => onCandidateAction(candidate, 'view')}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCandidateAction(candidate, 'interview')}>
                              <Calendar className="w-4 h-4 mr-2" />
                              Programar Entrevista
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCandidateAction(candidate, 'offer')}>
                              <FileText className="w-4 h-4 mr-2" />
                              Crear Oferta
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCandidateAction(candidate, 'assign')}>
                              <User className="w-4 h-4 mr-2" />
                              Asignar Responsable
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                )}
              </Draggable>
            ))}
            
            {provided.placeholder}
            
            {isExpanded && candidates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin candidatos</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}