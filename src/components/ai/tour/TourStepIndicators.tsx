
import React from 'react'
import { CheckCircle, Circle } from 'lucide-react'
import { TourStep } from '@/hooks/ai/useGuidedTourState'

interface TourStepIndicatorsProps {
  steps: TourStep[]
  currentStep: number
  completedSteps: string[]
}

export const TourStepIndicators = React.memo<TourStepIndicatorsProps>(({ 
  steps, 
  currentStep, 
  completedSteps 
}) => {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
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
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-2 ${
              completedSteps.includes(step.id) ? 'bg-green-300' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
})

TourStepIndicators.displayName = 'TourStepIndicators'
