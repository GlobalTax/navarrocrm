
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Zap } from 'lucide-react'

export function IntegrationWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isCompleted, setIsCompleted] = useState(false)

  const steps = [
    {
      title: 'Configuración Inicial',
      description: 'Configurar credenciales básicas',
      content: 'Configura las credenciales de acceso para Microsoft 365 u Outlook. Esto permitirá la sincronización de calendarios y correos.',
      action: 'Configurar Credenciales'
    },
    {
      title: 'Permisos y Accesos',
      description: 'Autorizar permisos necesarios',
      content: 'Autoriza los permisos necesarios para acceder a calendarios, contactos y correos. Estos permisos son seguros y pueden revocarse en cualquier momento.',
      action: 'Autorizar Permisos'
    },
    {
      title: 'Sincronización',
      description: 'Configurar sincronización automática',
      content: 'Configura la frecuencia de sincronización y los tipos de datos que deseas sincronizar automáticamente.',
      action: 'Configurar Sync'
    },
    {
      title: 'Prueba y Verificación',
      description: 'Verificar que todo funciona correctamente',
      content: 'Realizamos una prueba completa de la integración para asegurar que todo funciona correctamente.',
      action: 'Ejecutar Pruebas'
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep])
      setCurrentStep(currentStep + 1)
    } else {
      setCompletedSteps([...completedSteps, currentStep])
      setIsCompleted(true)
      localStorage.setItem('integration-wizard-completed', 'true')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    setIsCompleted(true)
    localStorage.setItem('integration-wizard-completed', 'true')
  }

  // Comprobar si ya se completó el wizard
  React.useEffect(() => {
    const completed = localStorage.getItem('integration-wizard-completed')
    if (completed) {
      setIsCompleted(true)
    }
  }, [])

  if (isCompleted) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            ¡Configuración Completada!
          </h3>
          <p className="text-green-700">
            Las integraciones están configuradas y listas para usar.
          </p>
        </CardContent>
      </Card>
    )
  }

  const progress = ((completedSteps.length) / steps.length) * 100
  const currentStepData = steps[currentStep]

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-blue-900">Asistente de Configuración</CardTitle>
              <p className="text-sm text-blue-700">Te guiamos paso a paso en la configuración</p>
            </div>
          </div>
          <Badge variant="secondary">
            Paso {currentStep + 1} de {steps.length}
          </Badge>
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
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  completedSteps.includes(index) 
                    ? 'bg-green-100 border-green-500 text-green-600'
                    : index === currentStep
                    ? 'bg-blue-100 border-blue-500 text-blue-600'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  {completedSteps.includes(index) ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs mt-1 text-center max-w-20 leading-tight">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  completedSteps.includes(index) ? 'bg-green-300' : 'bg-gray-300'
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
            <p className="text-sm text-gray-600 mb-4">
              {currentStepData.description}
            </p>
            <p className="text-gray-700">
              {currentStepData.content}
            </p>
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
            <Button variant="ghost" onClick={handleSkip}>
              Saltar asistente
            </Button>
          </div>
          
          <Button onClick={handleNext}>
            {currentStep < steps.length - 1 ? (
              <>
                {currentStepData.action}
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            ) : (
              'Finalizar'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
