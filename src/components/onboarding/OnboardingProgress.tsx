
import React from 'react'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle } from 'lucide-react'

interface OnboardingProgressProps {
  currentStep: number
  totalSteps: number
  percentage: number
  completedSteps: string[]
}

export function OnboardingProgress({
  currentStep,
  totalSteps,
  percentage,
  completedSteps
}: OnboardingProgressProps) {
  return (
    <div className="min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-900">
          Paso {currentStep} de {totalSteps}
        </span>
        <span className="text-xs text-gray-500">
          ({Math.round(percentage)}%)
        </span>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-2 mb-3"
      />
      
      <div className="flex items-center gap-1">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1
          const isCompleted = index < currentStep - 1
          const isCurrent = index === currentStep - 1
          
          return (
            <div
              key={index}
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors ${
                isCompleted
                  ? 'bg-green-100 text-green-700'
                  : isCurrent
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
