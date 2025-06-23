
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, ArrowRight, ArrowLeft, BookOpen, X } from 'lucide-react'

interface TourStep {
  id: string
  title: string
  description: string
  benefit: string
  category: string
}

const tourSteps: TourStep[] = [
  {
    id: 'voice',
    title: 'Asistente de Voz',
    description: 'Controla tu despacho con comandos de voz naturales',
    benefit: 'Ahorra 30 minutos diarios en tareas administrativas',
    category: 'Productividad'
  },
  {
    id: 'documents',
    title: 'Análisis de Documentos',
    description: 'Extrae información clave automáticamente de contratos y expedientes',
    benefit: 'Reduce 80% el tiempo de revisión de documentos',
    category: 'Automatización'
  },
  {
    id: 'time',
    title: 'Optimización de Tiempo',
    description: 'Analiza tus patrones de trabajo y sugiere mejoras',
    benefit: 'Incrementa 25% tu productividad diaria',
    category: 'Análisis'
  },
  {
    id: 'compliance',
    title: 'Monitor de Compliance',
    description: 'Detecta riesgos y vencimientos automáticamente',
    benefit: 'Evita multas y problemas regulatorios',
    category: 'Seguridad'
  },
  {
    id: 'business',
    title: 'Business Intelligence',
    description: 'Obtén insights predictivos sobre tu negocio',
    benefit: 'Identifica oportunidades de crecimiento',
    category: 'Estrategia'
  }
]

export function AIGuidedTour() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [showTour, setShowTour] = useState(() => {
    return !localStorage.getItem('ai-tour-completed')
  })

  const handleNext = () => {
    const currentStepId = tourSteps[currentStep].id
    if (!completedSteps.includes(currentStepId)) {
      setCompletedSteps([...completedSteps, currentStepId])
    }
    
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsCompleted(true)
      localStorage.setItem('ai-tour-completed', 'true')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    setShowTour(false)
    localStorage.setItem('ai-tour-completed', 'true')
  }

  if (!showTour || isCompleted) {
    return null
  }

  const progress = ((currentStep + 1) / tourSteps.length) * 100
  const currentStepData = tourSteps[currentStep]

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-blue-900">Tour de Herramientas IA</CardTitle>
              <p className="text-sm text-blue-700">Descubre el poder de la inteligencia artificial</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {currentStep + 1} de {tourSteps.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-blue-600">
            <span>Progreso</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Indicadores de pasos */}
        <div className="flex items-center justify-between">
          {tourSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  completedSteps.includes(step.id)
                    ? 'bg-green-100 border-green-500 text-green-600'
                    : index === currentStep
                    ? 'bg-blue-100 border-blue-500 text-blue-600'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  {completedSteps.includes(step.id) ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs mt-1 text-center max-w-16 leading-tight">
                  {step.category}
                </span>
              </div>
              {index < tourSteps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  completedSteps.includes(step.id) ? 'bg-green-300' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Contenido del paso actual */}
        <div className="text-center space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-gray-700 mb-4">
              {currentStepData.description}
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm font-medium text-green-800">
                💡 Beneficio: {currentStepData.benefit}
              </p>
            </div>
          </div>
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
            <Button variant="ghost" onClick={handleClose}>
              Saltar tour
            </Button>
          </div>
          
          <Button onClick={handleNext}>
            {currentStep < tourSteps.length - 1 ? (
              <>
                Siguiente
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            ) : (
              'Comenzar'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
