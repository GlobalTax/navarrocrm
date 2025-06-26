
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Play, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Workflow,
  Plus,
  BarChart3,
  Users,
  Zap
} from 'lucide-react'
import { AIWorkflow, WorkflowTemplate } from '@/types/aiTypes'

interface AIWorkflowPanelProps {
  workflows: AIWorkflow[]
  workflowTemplates: WorkflowTemplate[]
  activeWorkflow: AIWorkflow | null
  workflowProgress: number
  currentWorkflowStep: number
  onExecuteWorkflow: (workflowId: string) => void
  onCreateFromTemplate: (templateId: string, customName?: string) => void
}

export const AIWorkflowPanel: React.FC<AIWorkflowPanelProps> = ({
  workflows,
  workflowTemplates,
  activeWorkflow,
  workflowProgress,
  currentWorkflowStep,
  onExecuteWorkflow,
  onCreateFromTemplate
}) => {
  const [showTemplates, setShowTemplates] = useState(false)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflows Inteligentes</h2>
          <p className="text-gray-600">Automatiza procesos complejos con secuencias de herramientas IA</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{workflows.length}</p>
              <p className="text-sm text-gray-500">Workflows</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{workflowTemplates.length}</p>
              <p className="text-sm text-gray-500">Templates</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {workflows.reduce((sum, w) => sum + w.usageCount, 0)}
              </p>
              <p className="text-sm text-gray-500">Ejecuciones</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow activo */}
      {activeWorkflow && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-600 animate-pulse" />
              Ejecutando: {activeWorkflow.name}
            </CardTitle>
            <CardDescription>
              Paso {currentWorkflowStep + 1} de {activeWorkflow.steps.length} • 
              {activeWorkflow.steps[currentWorkflowStep]?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso del workflow</span>
                  <span>{Math.round(workflowProgress)}%</span>
                </div>
                <Progress value={workflowProgress} className="h-3" />
              </div>
              
              {/* Pasos del workflow */}
              <div className="flex items-center gap-2 overflow-x-auto">
                {activeWorkflow.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-2">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${index < currentWorkflowStep ? 'bg-green-100 text-green-800' : 
                        index === currentWorkflowStep ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-600'}
                    `}>
                      {index < currentWorkflowStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
                    </div>
                    {index < activeWorkflow.steps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón para crear desde templates */}
      <div className="flex gap-4">
        <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Crear desde Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Templates de Workflow</DialogTitle>
              <DialogDescription>
                Selecciona un template para crear un nuevo workflow automatizado
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 md:grid-cols-2">
              {workflowTemplates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getDifficultyColor(template.difficulty)}>
                            {template.difficulty}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {template.estimatedTime} min
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <BarChart3 className="h-3 w-3" />
                          {template.popularity}% popularidad
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <CardDescription>{template.description}</CardDescription>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Pasos incluidos:</h4>
                      <div className="space-y-1">
                        {template.steps.map((step, index) => (
                          <div key={index} className="text-xs flex items-center gap-2">
                            <span className="w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-medium">
                              {index + 1}
                            </span>
                            <span className="text-gray-600">{step.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button
                      onClick={() => {
                        onCreateFromTemplate(template.id)
                        setShowTemplates(false)
                      }}
                      className="w-full"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Workflow
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de workflows creados */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{workflow.category}</Badge>
                    {workflow.isTemplate && (
                      <Badge variant="outline" className="text-xs">Template</Badge>
                    )}
                  </div>
                </div>
                <Workflow className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <CardDescription className="text-sm">
                {workflow.description}
              </CardDescription>
              
              {/* Estadísticas */}
              <div className="grid grid-cols-3 gap-3 text-center border-t pt-3">
                <div>
                  <p className="text-sm font-semibold">{workflow.steps.length}</p>
                  <p className="text-xs text-gray-500">Pasos</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">{workflow.usageCount}</p>
                  <p className="text-xs text-gray-500">Usos</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-600">
                    {Math.round(workflow.successRate * 100)}%
                  </p>
                  <p className="text-xs text-gray-500">Éxito</p>
                </div>
              </div>
              
              {/* Información adicional */}
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>~{workflow.estimatedTime} minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span>Creado {formatDate(workflow.createdAt)}</span>
                </div>
                {workflow.lastUsed && (
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    <span>Último uso: {formatDate(workflow.lastUsed)}</span>
                  </div>
                )}
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {workflow.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {workflow.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{workflow.tags.length - 3}
                  </Badge>
                )}
              </div>
              
              <Button
                onClick={() => onExecuteWorkflow(workflow.id)}
                disabled={!!activeWorkflow}
                className="w-full"
              >
                {activeWorkflow ? (
                  <>
                    <Play className="h-4 w-4 mr-2 animate-pulse" />
                    Ejecutando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Ejecutar Workflow
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {workflows.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Workflow className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No tienes workflows aún
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
              Crea tu primer workflow automatizado usando uno de nuestros templates predefinidos.
            </p>
            <Button onClick={() => setShowTemplates(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Workflow
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
