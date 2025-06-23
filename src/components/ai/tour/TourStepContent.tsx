
import React from 'react'
import { TourStep } from '@/hooks/ai/useGuidedTourState'

interface TourStepContentProps {
  step: TourStep
}

export const TourStepContent = React.memo<TourStepContentProps>(({ step }) => {
  return (
    <div className="text-center space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {step.title}
        </h3>
        <p className="text-gray-700 mb-4">
          {step.description}
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm font-medium text-green-800">
            💡 Beneficio: {step.benefit}
          </p>
        </div>
      </div>
    </div>
  )
})

TourStepContent.displayName = 'TourStepContent'
