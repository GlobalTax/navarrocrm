import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  FileText, 
  Users, 
  Scale,
  Building,
  User,
  ArrowRight,
  Zap,
  Award,
  MapPin
} from 'lucide-react'
import { useLegalJourneyEngine } from '@/hooks/useLegalJourneyEngine'

interface LegalJourneyVisualizerProps {
  selectedProspect?: any
  onProspectChange?: (prospect: any) => void
}

export const LegalJourneyVisualizer: React.FC<LegalJourneyVisualizerProps> = ({
  selectedProspect,
  onProspectChange
}) => {
  const [selectedJourneyType, setSelectedJourneyType] = useState<string>('civil')
  
  const {
    journeyTypes,
    getJourneySteps,
    calculateProgress,
    getEstimatedDuration,
    startJourney,
    updateStep
  } = useLegalJourneyEngine()

  const currentSteps = getJourneySteps(selectedJourneyType)
  const progress = selectedProspect ? calculateProgress(selectedProspect.id) : 0
  const estimatedDuration = getEstimatedDuration(selectedJourneyType)

  const handleStartJourney = () => {
    if (selectedProspect) {
      startJourney(selectedProspect.id, selectedJourneyType)
    }
  }

  const getStepIcon = (step: any) => {
    const iconMap = {
      'inicial': FileText,
      'documentacion': FileText,
      'analisis': Scale,
      'propuesta': Building,
      'contrato': User,
      'seguimiento': Clock
    }
    const Icon = iconMap[step.type] || Circle
    return <Icon className="h-5 w-5" />
  }

  const getStepStatus = (step: any, index: number) => {
    if (progress > index) return 'completed'
    if (progress === index) return 'current'
    return 'pending'
  }

  return (
    <div className="space-y-6">
      {/* Header del Journey */}
      <Card className="border-0.5 border-black rounded-[10px] bg-gradient-to-r from-primary/5 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-[10px]">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-xl">Roadmap Legal Interactivo</div>
              <div className="text-sm font-normal text-gray-600">
                Visualización paso a paso del proceso legal
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Progreso actual: {progress} de {currentSteps.length} pasos completados
            </div>
            <Badge 
              variant="outline" 
              className="border-0.5 border-primary rounded-[10px] text-primary"
            >
              {estimatedDuration} días estimados
            </Badge>
          </div>
          <Progress value={(progress / currentSteps.length) * 100} className="mt-3" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Selector de Tipo de Journey */}
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader>
            <CardTitle className="text-base">Tipo de Caso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {journeyTypes.map((type) => (
              <Button
                key={type.id}
                variant={selectedJourneyType === type.id ? "default" : "outline"}
                className="w-full justify-start border-0.5 border-black rounded-[10px]"
                onClick={() => setSelectedJourneyType(type.id)}
              >
                <div className="flex items-center gap-2">
                  {getStepIcon({ type: type.id })}
                  <div className="text-left">
                    <div className="font-medium">{type.name}</div>
                    <div className="text-xs opacity-70">{type.duration} días</div>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Journey Visual */}
        <div className="lg:col-span-3">
          <Card className="border-0.5 border-black rounded-[10px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Roadmap: {journeyTypes.find(t => t.id === selectedJourneyType)?.name}</span>
                {selectedProspect && (
                  <Button 
                    onClick={handleStartJourney}
                    className="bg-primary hover:bg-primary/90 text-white border-0.5 border-black rounded-[10px]"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Iniciar Journey
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {currentSteps.map((step, index) => {
                  const status = getStepStatus(step, index)
                  
                  return (
                    <div 
                      key={step.id} 
                      className={`relative flex items-start gap-4 p-4 rounded-[10px] transition-all ${
                        status === 'completed' ? 'bg-green-50 border-green-200' :
                        status === 'current' ? 'bg-blue-50 border-blue-200 shadow-lg' :
                        'bg-gray-50 border-gray-200'
                      } border-0.5`}
                    >
                      {/* Línea de conexión */}
                      {index < currentSteps.length - 1 && (
                        <div className="absolute left-8 top-16 w-0.5 h-8 bg-gray-300"></div>
                      )}
                      
                      {/* Icono de estado */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        status === 'completed' ? 'bg-green-600 text-white' :
                        status === 'current' ? 'bg-blue-600 text-white' :
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {status === 'completed' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : status === 'current' ? (
                          <Clock className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </div>

                      {/* Contenido del paso */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-lg">{step.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className="border-0.5 border-black rounded-[10px]"
                            >
                              {step.duration} días
                            </Badge>
                            {step.isAutomated && (
                              <Badge 
                                variant="outline" 
                                className="border-0.5 border-purple-400 text-purple-600 rounded-[10px]"
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                Automatizado
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{step.description}</p>
                        
                        {/* Deliverables */}
                        {step.deliverables && step.deliverables.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-700">Entregables:</div>
                            <div className="grid grid-cols-2 gap-2">
                              {step.deliverables.map((deliverable, idx) => (
                                <div 
                                  key={idx}
                                  className="flex items-center gap-2 text-sm text-gray-600"
                                >
                                  <FileText className="h-4 w-4" />
                                  {deliverable}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Acciones */}
                        {status === 'current' && (
                          <div className="mt-4 flex gap-2">
                            <Button 
                              size="sm"
                              className="bg-primary hover:bg-primary/90 text-white border-0.5 border-black rounded-[10px]"
                              onClick={() => updateStep(step.id, 'completed')}
                            >
                              Marcar Completado
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              className="border-0.5 border-black rounded-[10px]"
                            >
                              Ver Detalles
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Journey Completado */}
              {progress === currentSteps.length && (
                <Card className="border-0.5 border-green-500 bg-green-50 rounded-[10px] mt-6">
                  <CardContent className="p-4 text-center">
                    <Award className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-green-800 mb-2">
                      ¡Journey Completado!
                    </h3>
                    <p className="text-green-700 mb-4">
                      El cliente ha completado exitosamente todo el proceso legal
                    </p>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white border-0.5 border-black rounded-[10px]"
                    >
                      Generar Reporte Final
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}