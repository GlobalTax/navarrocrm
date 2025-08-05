import React from 'react'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface StepInfo {
  number: number
  title: string
  icon: React.ComponentType<any>
  isRequired: boolean
}

interface EnhancedProgressBarProps {
  steps: StepInfo[]
  currentStep: number
  completedSteps: number[]
  stepValidation: Record<number, boolean>
  errors: Record<number, string[]>
}

export function EnhancedProgressBar({ 
  steps, 
  currentStep, 
  completedSteps, 
  stepValidation,
  errors 
}: EnhancedProgressBarProps) {
  const progressPercentage = (completedSteps.length / steps.length) * 100

  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) return 'completed'
    if (stepNumber === currentStep) return 'current'
    if (stepNumber < currentStep) return 'available'
    return 'pending'
  }

  const getStepIcon = (stepNumber: number, stepInfo: StepInfo) => {
    const status = getStepStatus(stepNumber)
    const hasErrors = errors[stepNumber]?.length > 0

    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    
    if (status === 'current' && hasErrors) {
      return <AlertCircle className="h-5 w-5 text-red-600" />
    }
    
    if (status === 'current') {
      return <Clock className="h-5 w-5 text-blue-600" />
    }

    return <Circle className="h-5 w-5 text-gray-400" />
  }

  const getStepStyles = (stepNumber: number, stepInfo: StepInfo) => {
    const status = getStepStatus(stepNumber)
    const hasErrors = errors[stepNumber]?.length > 0
    
    let bgColor = 'bg-gray-100'
    let textColor = 'text-gray-400'
    let borderColor = 'border-gray-200'

    switch (status) {
      case 'completed':
        bgColor = 'bg-green-50'
        textColor = 'text-green-700'
        borderColor = 'border-green-200'
        break
      case 'current':
        if (hasErrors) {
          bgColor = 'bg-red-50'
          textColor = 'text-red-700'
          borderColor = 'border-red-200'
        } else {
          bgColor = 'bg-blue-50'
          textColor = 'text-blue-700'
          borderColor = 'border-blue-200'
        }
        break
      case 'available':
        bgColor = 'bg-gray-50'
        textColor = 'text-gray-600'
        borderColor = 'border-gray-300'
        break
    }

    return `${bgColor} ${textColor} ${borderColor} border-0.5 rounded-[10px] transition-all duration-200`
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar Principal */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Progreso General
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progressPercentage)}% completado
          </span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-3 bg-gray-100 rounded-[10px]"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{completedSteps.length} de {steps.length} pasos completados</span>
          <span>Paso actual: {currentStep}</span>
        </div>
      </div>

      {/* Steps Detallados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {steps.map((step) => {
          const status = getStepStatus(step.number)
          const hasErrors = errors[step.number]?.length > 0
          const isValid = stepValidation[step.number] || false

          return (
            <div
              key={step.number}
              className={`p-3 ${getStepStyles(step.number, step)} cursor-pointer hover:shadow-sm`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getStepIcon(step.number, step)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate">
                      {step.number}. {step.title}
                    </h4>
                    {step.isRequired && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        Obligatorio
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-70">
                      {status === 'completed' && 'Completado'}
                      {status === 'current' && !hasErrors && 'En progreso'}
                      {status === 'current' && hasErrors && 'Requiere atención'}
                      {status === 'available' && 'Disponible'}
                      {status === 'pending' && 'Pendiente'}
                    </span>
                    
                    {status === 'current' && !hasErrors && isValid && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                  </div>

                  {hasErrors && (
                    <div className="mt-1">
                      <p className="text-xs text-red-600 truncate">
                        {errors[step.number][0]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Resumen de Errores */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-[10px] p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-2">
                Atención requerida en algunos pasos
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {Object.entries(errors).map(([stepNumber, stepErrors]) => (
                  <li key={stepNumber}>
                    Paso {stepNumber}: {stepErrors.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}