
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRight, ArrowLeft, CheckCircle, Zap, Settings, Target, Sparkles } from 'lucide-react'

interface WorkflowWizardProps {
  onComplete: (workflowData: any) => void
  onCancel: () => void
}

export function WorkflowWizard({ onComplete, onCancel }: WorkflowWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [workflowData, setWorkflowData] = useState({
    name: '',
    description: '',
    trigger: '',
    scenario: '',
    actions: [],
    priority: 1
  })

  const steps = [
    {
      title: 'Información Básica',
      description: 'Dale un nombre y descripción a tu workflow',
      icon: Settings
    },
    {
      title: 'Escenario de Uso',
      description: 'Cuéntanos cuándo quieres que se active',
      icon: Target
    },
    {
      title: 'Acciones Automáticas',
      description: 'Define qué acciones realizar automáticamente',
      icon: Zap
    },
    {
      title: 'Revisión y Confirmación',
      description: 'Revisa tu configuración antes de crear',
      icon: CheckCircle
    }
  ]

  const commonScenarios = [
    {
      id: 'new_client',
      name: 'Nuevo Cliente',
      description: 'Automatizar el proceso de bienvenida para nuevos clientes',
      trigger: 'client_added',
      suggestedActions: ['send_welcome_email', 'create_initial_tasks', 'assign_account_manager']
    },
    {
      id: 'case_created',
      name: 'Nuevo Expediente',
      description: 'Configurar expedientes automáticamente al crearlos',
      trigger: 'case_created',
      suggestedActions: ['create_folder_structure', 'assign_team', 'set_deadlines']
    },
    {
      id: 'task_overdue',
      name: 'Tareas Vencidas',
      description: 'Gestionar tareas que se han pasado de fecha',
      trigger: 'task_overdue',
      suggestedActions: ['notify_manager', 'escalate_priority', 'send_reminder']
    },
    {
      id: 'proposal_sent',
      name: 'Propuesta Enviada',
      description: 'Seguimiento automático de propuestas enviadas',
      trigger: 'proposal_sent',
      suggestedActions: ['schedule_follow_up', 'track_email_opens', 'set_reminder']
    }
  ]

  const availableActions = [
    { id: 'send_email', name: 'Enviar Email', description: 'Enviar un email automático' },
    { id: 'create_task', name: 'Crear Tarea', description: 'Crear una nueva tarea' },
    { id: 'notify_team', name: 'Notificar Equipo', description: 'Enviar notificación al equipo' },
    { id: 'update_status', name: 'Actualizar Estado', description: 'Cambiar el estado de un elemento' },
    { id: 'schedule_meeting', name: 'Programar Reunión', description: 'Crear una cita en el calendario' },
    { id: 'generate_document', name: 'Generar Documento', description: 'Crear un documento automáticamente' }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Completar wizard
      onComplete(workflowData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleScenarioSelect = (scenario: any) => {
    setWorkflowData(prev => ({
      ...prev,
      name: scenario.name,
      description: scenario.description,
      trigger: scenario.trigger,
      scenario: scenario.id
    }))
  }

  const handleActionToggle = (actionId: string) => {
    setWorkflowData(prev => ({
      ...prev,
      actions: prev.actions.includes(actionId)
        ? prev.actions.filter((id: string) => id !== actionId)
        : [...prev.actions, actionId]
    }))
  }

  const progress = ((currentStep + 1) / steps.length) * 100
  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-blue-900">Crear Workflow Inteligente</CardTitle>
                <p className="text-sm text-blue-700">Te guiamos paso a paso para automatizar tu proceso</p>
              </div>
            </div>
            <Badge variant="secondary">
              Paso {currentStep + 1}de {steps.length}
            </Badge>
          </div>
          
          <div className="space-y-2 mt-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-blue-600">
              <span>{currentStepData.title}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Indicadores de pasos */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    index <= currentStep
                      ? 'bg-blue-100 border-blue-500 text-blue-600'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs mt-2 text-center max-w-20 leading-tight">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-blue-300' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Contenido por paso */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Icon className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="text-xl font-semibold">{currentStepData.title}</h3>
                <p className="text-gray-600">{currentStepData.description}</p>
              </div>
            </div>

            {/* Step 0: Información Básica */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre del Workflow</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Bienvenida para nuevos clientes"
                    value={workflowData.name}
                    onChange={(e) => setWorkflowData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe brevemente qué hará este workflow..."
                    value={workflowData.description}
                    onChange={(e) => setWorkflowData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Step 1: Escenario de Uso */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h4 className="font-medium">Selecciona un escenario común o crea uno personalizado:</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {commonScenarios.map((scenario) => (
                    <Card 
                      key={scenario.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        workflowData.scenario === scenario.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => handleScenarioSelect(scenario)}
                    >
                      <CardContent className="p-4">
                        <h5 className="font-medium mb-1">{scenario.name}</h5>
                        <p className="text-sm text-gray-600">{scenario.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Acciones */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h4 className="font-medium">¿Qué acciones quieres automatizar?</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {availableActions.map((action) => (
                    <Card 
                      key={action.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        workflowData.actions.includes(action.id) ? 'ring-2 ring-green-500 bg-green-50' : ''
                      }`}
                      onClick={() => handleActionToggle(action.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium mb-1">{action.name}</h5>
                            <p className="text-sm text-gray-600">{action.description}</p>
                          </div>
                          {workflowData.actions.includes(action.id) && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Revisión */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h4 className="font-medium">Resumen de tu Workflow:</h4>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Nombre:</span>
                    <p className="text-gray-900">{workflowData.name}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Descripción:</span>
                    <p className="text-gray-900">{workflowData.description}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Se activará cuando:</span>
                    <p className="text-gray-900">
                      {commonScenarios.find(s => s.id === workflowData.scenario)?.name || 'Escenario personalizado'}
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Acciones automáticas:</span>
                    <ul className="list-disc list-inside text-gray-900 ml-4">
                      {workflowData.actions.map((actionId: string) => {
                        const action = availableActions.find(a => a.id === actionId)
                        return <li key={actionId}>{action?.name}</li>
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controles de navegación */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
              )}
              <Button variant="ghost" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
            
            <Button 
              onClick={handleNext}
              disabled={
                (currentStep === 0 && (!workflowData.name || !workflowData.description)) ||
                (currentStep === 1 && !workflowData.scenario) ||
                (currentStep === 2 && workflowData.actions.length === 0)
              }
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                'Crear Workflow'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
