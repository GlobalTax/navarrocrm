import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  BarChart3,
  Download,
  Settings,
  Lightbulb
} from 'lucide-react'
import { AdvancedPhaseManager } from './AdvancedPhaseManager'
import { PhaseTemplateManager } from './PhaseTemplateManager'
import { AdvancedProposalPhase, PhaseTemplate } from '@/types/phase.types'
import { useAdvancedPhases } from '@/hooks/useAdvancedPhases'

export const PhaseDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const { 
    phases, 
    setPhases, 
    calculatePhaseMetrics, 
    exportPhaseReport 
  } = useAdvancedPhases()

  const handleApplyTemplate = (template: PhaseTemplate) => {
    const newPhases: AdvancedProposalPhase[] = template.phases.map(templatePhase => ({
      ...templatePhase,
      id: crypto.randomUUID(),
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
    setPhases(prev => [...prev, ...newPhases])
  }

  const metrics = phases.length > 0 ? calculatePhaseMetrics(phases) : null

  const getActivePhases = () => phases.filter(p => p.status === 'in_progress')
  const getOverduePhases = () => phases.filter(p => {
    if (!p.timeline.plannedEndDate) return false
    return new Date(p.timeline.plannedEndDate) < new Date() && p.status !== 'completed'
  })
  const getUpcomingDeadlines = () => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    return phases.filter(p => {
      if (!p.timeline.plannedEndDate) return false
      const deadline = new Date(p.timeline.plannedEndDate)
      return deadline <= nextWeek && deadline >= new Date() && p.status !== 'completed'
    })
  }

  const getRiskFactors = () => {
    const risks = []
    const overdue = getOverduePhases()
    const overBudget = phases.filter(p => 
      p.budget.actual && p.budget.actual > p.budget.estimated * 1.1
    )
    
    if (overdue.length > 0) {
      risks.push({
        type: 'timeline',
        severity: 'high' as const,
        message: `${overdue.length} fase(s) retrasada(s)`,
        count: overdue.length
      })
    }
    
    if (overBudget.length > 0) {
      risks.push({
        type: 'budget',
        severity: 'medium' as const,
        message: `${overBudget.length} fase(s) sobre presupuesto`,
        count: overBudget.length
      })
    }

    return risks
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Gestión Avanzada de Fases</h2>
          <p className="text-muted-foreground">
            Control completo del progreso y desarrollo de proyectos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportPhaseReport(phases)}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Reporte
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="phases">Gestión de Fases</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        {/* Resumen General */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPIs Principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{phases.length}</p>
                    <p className="text-sm text-muted-foreground">Total Fases</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {metrics?.completedPhases || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Completadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {getActivePhases().length}
                    </p>
                    <p className="text-sm text-muted-foreground">En Progreso</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {getOverduePhases().length}
                    </p>
                    <p className="text-sm text-muted-foreground">Retrasadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas y Notificaciones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Próximos Vencimientos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Próximos Vencimientos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getUpcomingDeadlines().length > 0 ? (
                  <div className="space-y-3">
                    {getUpcomingDeadlines().slice(0, 5).map((phase) => (
                      <div key={phase.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-l-yellow-400">
                        <div>
                          <p className="font-medium">{phase.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Vence: {phase.timeline.plannedEndDate ? 
                              new Date(phase.timeline.plannedEndDate).toLocaleDateString('es-ES') : 
                              'Sin fecha'
                            }
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-yellow-100">
                          {Math.ceil((new Date(phase.timeline.plannedEndDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2" />
                    <p className="text-muted-foreground">No hay vencimientos próximos</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Factores de Riesgo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Factores de Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getRiskFactors().length > 0 ? (
                  <div className="space-y-3">
                    {getRiskFactors().map((risk, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        risk.severity === 'high' ? 'bg-red-50 border-l-red-400' :
                        risk.severity === 'medium' ? 'bg-yellow-50 border-l-yellow-400' :
                        'bg-blue-50 border-l-blue-400'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{risk.message}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              Riesgo {risk.severity} - {risk.type}
                            </p>
                          </div>
                          <Badge variant={risk.severity === 'high' ? 'destructive' : 'secondary'}>
                            {risk.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2" />
                    <p className="text-muted-foreground">No se detectaron riesgos</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Progreso General */}
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progreso General del Proyecto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Fases Completadas</span>
                      <span>{metrics.completedPhases}/{metrics.totalPhases}</span>
                    </div>
                    <Progress 
                      value={metrics.totalPhases > 0 ? (metrics.completedPhases / metrics.totalPhases) * 100 : 0} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {metrics.onTimeCompletion.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Entrega a tiempo</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {metrics.averageDuration.toFixed(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">Días promedio/fase</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${
                        metrics.budgetVariance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {metrics.budgetVariance > 0 ? '+' : ''}{metrics.budgetVariance.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Varianza presupuesto</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Gestión de Fases */}
        <TabsContent value="phases">
          <AdvancedPhaseManager
            phases={phases}
            onPhasesChange={setPhases}
            showTimeline={true}
            showMetrics={true}
          />
        </TabsContent>

        {/* Plantillas */}
        <TabsContent value="templates">
          <PhaseTemplateManager onApplyTemplate={handleApplyTemplate} />
        </TabsContent>

        {/* Análisis */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Análisis Avanzado</h3>
              <p className="text-muted-foreground mb-4">
                Módulo de análisis y reportes detallados en desarrollo
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lightbulb className="h-4 w-4" />
                <span>Próximamente: Gráficos interactivos, tendencias y predicciones</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}