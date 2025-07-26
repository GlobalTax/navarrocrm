import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  XCircle
} from 'lucide-react'
import { AdvancedProposalPhase, PhaseStatus } from '@/types/phase.types'
import { useAdvancedPhases } from '@/hooks/useAdvancedPhases'

interface AdvancedPhaseManagerProps {
  phases: AdvancedProposalPhase[]
  onPhasesChange: (phases: AdvancedProposalPhase[]) => void
  showTimeline?: boolean
  showMetrics?: boolean
}

export const AdvancedPhaseManager: React.FC<AdvancedPhaseManagerProps> = ({ 
  phases, 
  onPhasesChange,
  showTimeline = true,
  showMetrics = true
}) => {
  const { 
    updatePhaseStatus, 
    updatePhaseProgress, 
    validatePhaseDependencies,
    calculatePhaseMetrics 
  } = useAdvancedPhases()
  
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)

  const getStatusIcon = (status: PhaseStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'in_progress': return <Play className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      case 'on_hold': return <Pause className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: PhaseStatus) => {
    switch (status) {
      case 'pending': return 'bg-muted text-muted-foreground'
      case 'in_progress': return 'bg-primary text-primary-foreground'
      case 'completed': return 'bg-green-500 text-white'
      case 'cancelled': return 'bg-red-500 text-white'
      case 'on_hold': return 'bg-yellow-500 text-white'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const addPhase = () => {
    const newPhase: AdvancedProposalPhase = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      status: 'pending',
      timeline: {},
      dependencies: [],
      progress: {
        completionPercentage: 0,
        completedTasks: 0,
        totalTasks: 0,
        milestonesAchieved: 0,
        totalMilestones: 0
      },
      approval: {
        status: 'pending',
        requiredApprovers: []
      },
      services: [],
      deliverables: [''],
      paymentPercentage: 0,
      budget: {
        estimated: 0
      },
      documentIds: [],
      teamMembers: [],
      notifications: [],
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      customFields: {}
    }
    onPhasesChange([...phases, newPhase])
  }

  const updatePhase = (phaseId: string, updates: Partial<AdvancedProposalPhase>) => {
    onPhasesChange(phases.map(p => 
      p.id === phaseId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ))
  }

  const handleStatusChange = (phaseId: string, status: PhaseStatus) => {
    updatePhaseStatus(phaseId, status)
    updatePhase(phaseId, { status })
  }

  const metrics = showMetrics ? calculatePhaseMetrics(phases) : null

  return (
    <div className="space-y-6">
      {/* Métricas Generales */}
      {showMetrics && metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Métricas del Proyecto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{metrics.completedPhases}</div>
                <div className="text-sm text-muted-foreground">de {metrics.totalPhases} fases</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.onTimeCompletion.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">A tiempo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.averageDuration.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">días promedio</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${metrics.budgetVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {metrics.budgetVariance > 0 ? '+' : ''}{metrics.budgetVariance.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Varianza presupuesto</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Visual */}
      {showTimeline && phases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline del Proyecto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {phases.map((phase, index) => (
                <div key={phase.id} className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(phase.status)}`}>
                      {getStatusIcon(phase.status)}
                    </div>
                    {index < phases.length - 1 && (
                      <div className="w-0.5 h-8 bg-border mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{phase.name || `Fase ${index + 1}`}</h4>
                      <Badge variant="outline">{phase.status}</Badge>
                    </div>
                    <Progress value={phase.progress.completionPercentage} className="mt-2" />
                    <div className="text-sm text-muted-foreground mt-1">
                      {phase.progress.completionPercentage}% completado
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gestión de Fases */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-base font-semibold">Gestión Avanzada de Fases</Label>
          <Button onClick={addPhase} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Añadir Fase
          </Button>
        </div>

        {phases.map((phase, phaseIndex) => (
          <Card key={phase.id} className="border-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">
                    {phase.name || `Fase ${phaseIndex + 1}`}
                  </CardTitle>
                  <Badge className={getStatusColor(phase.status)}>
                    {getStatusIcon(phase.status)}
                    <span className="ml-1">{phase.status}</span>
                  </Badge>
                </div>
                <Button
                  onClick={() => onPhasesChange(phases.filter(p => p.id !== phase.id))}
                  variant="ghost"
                  size="sm"
                  disabled={phases.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Información Básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre de la Fase</Label>
                  <Input
                    value={phase.name}
                    onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                    placeholder="Ej: Diagnóstico Integral"
                  />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select
                    value={phase.status}
                    onValueChange={(value: PhaseStatus) => handleStatusChange(phase.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En Progreso</SelectItem>
                      <SelectItem value="completed">Completada</SelectItem>
                      <SelectItem value="on_hold">En Pausa</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Progreso */}
              <div>
                <Label>Progreso de la Fase</Label>
                <div className="mt-2 space-y-2">
                  <Progress value={phase.progress.completionPercentage} />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{phase.progress.completionPercentage}% completado</span>
                    <span>{phase.progress.completedTasks}/{phase.progress.totalTasks} tareas</span>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={phase.progress.completionPercentage}
                    onChange={(e) => {
                      const percentage = Number(e.target.value)
                      updatePhaseProgress(phase.id, percentage)
                      updatePhase(phase.id, {
                        progress: { ...phase.progress, completionPercentage: percentage }
                      })
                    }}
                    placeholder="Porcentaje de completitud"
                  />
                </div>
              </div>

              {/* Timeline */}
              <div>
                <Label>Fechas del Proyecto</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  <div>
                    <Label className="text-xs">Inicio Planificado</Label>
                    <Input
                      type="date"
                      value={phase.timeline.plannedStartDate?.split('T')[0] || ''}
                      onChange={(e) => updatePhase(phase.id, {
                        timeline: { ...phase.timeline, plannedStartDate: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fin Planificado</Label>
                    <Input
                      type="date"
                      value={phase.timeline.plannedEndDate?.split('T')[0] || ''}
                      onChange={(e) => updatePhase(phase.id, {
                        timeline: { ...phase.timeline, plannedEndDate: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Inicio Real</Label>
                    <Input
                      type="date"
                      value={phase.timeline.actualStartDate?.split('T')[0] || ''}
                      onChange={(e) => updatePhase(phase.id, {
                        timeline: { ...phase.timeline, actualStartDate: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fin Real</Label>
                    <Input
                      type="date"
                      value={phase.timeline.actualEndDate?.split('T')[0] || ''}
                      onChange={(e) => updatePhase(phase.id, {
                        timeline: { ...phase.timeline, actualEndDate: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Presupuesto */}
              <div>
                <Label>Gestión de Presupuesto</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  <div>
                    <Label className="text-xs">Presupuesto Estimado (€)</Label>
                    <Input
                      type="number"
                      value={phase.budget.estimated}
                      onChange={(e) => updatePhase(phase.id, {
                        budget: { ...phase.budget, estimated: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Gasto Real (€)</Label>
                    <Input
                      type="number"
                      value={phase.budget.actual || ''}
                      onChange={(e) => updatePhase(phase.id, {
                        budget: { ...phase.budget, actual: Number(e.target.value) }
                      })}
                    />
                  </div>
                  {phase.budget.actual && (
                    <div>
                      <Label className="text-xs">Varianza</Label>
                      <div className={`text-sm font-medium ${
                        (phase.budget.actual - phase.budget.estimated) > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {phase.budget.actual - phase.budget.estimated > 0 ? '+' : ''}
                        {(phase.budget.actual - phase.budget.estimated).toFixed(2)} €
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={phase.description}
                  onChange={(e) => updatePhase(phase.id, { description: e.target.value })}
                  placeholder="Descripción detallada de la fase..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}