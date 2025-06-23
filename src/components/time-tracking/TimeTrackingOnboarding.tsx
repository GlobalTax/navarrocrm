
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Play, Square, CheckCircle, ArrowRight } from 'lucide-react'

export function TimeTrackingOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const steps = [
    {
      title: 'Bienvenido al Control de Tiempo',
      description: 'Aprende a registrar y gestionar tu tiempo de manera eficiente',
      icon: Clock,
      content: 'El control de tiempo te permite registrar las horas dedicadas a cada cliente y proyecto, facilitando la facturación y el análisis de productividad.'
    },
    {
      title: 'Cómo Iniciar el Timer',
      description: 'Usa el temporizador para registrar tiempo en tiempo real',
      icon: Play,
      content: 'Haz clic en el botón "Iniciar" para comenzar a cronometrar. Puedes agregar una descripción y seleccionar si el tiempo es facturable.'
    },
    {
      title: 'Parar y Guardar',
      description: 'Detén el timer y guarda tu entrada de tiempo',
      icon: Square,
      content: 'Al parar el timer, se guardará automáticamente la entrada con la duración registrada. Puedes editarla posteriormente si es necesario.'
    },
    {
      title: 'Revisar y Analizar',
      description: 'Utiliza los filtros y estadísticas para analizar tu tiempo',
      icon: CheckCircle,
      content: 'Revisa tus entradas de tiempo, filtra por proyecto o cliente, y analiza tus patrones de trabajo para mejorar tu productividad.'
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsCompleted(true)
      localStorage.setItem('time-tracking-onboarding-completed', 'true')
    }
  }

  const handleSkip = () => {
    setIsCompleted(true)
    localStorage.setItem('time-tracking-onboarding-completed', 'true')
  }

  // Comprobar si ya se completó el onboarding
  React.useEffect(() => {
    const completed = localStorage.getItem('time-tracking-onboarding-completed')
    if (completed) {
      setIsCompleted(true)
    }
  }, [])

  if (isCompleted) {
    return null
  }

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-blue-900">{currentStepData.title}</CardTitle>
              <p className="text-sm text-blue-700">{currentStepData.description}</p>
            </div>
          </div>
          <Badge variant="secondary">
            {currentStep + 1} de {steps.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">
          {currentStepData.content}
        </p>
        
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Saltar tutorial
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <Button onClick={handleNext}>
              {currentStep < steps.length - 1 ? (
                <>
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                'Comenzar'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
