
import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TourProgress } from '@/components/ai/tour/TourProgress'
import { TourProgressBar } from '@/components/ai/tour/TourProgressBar'
import { TourStepIndicators } from '@/components/ai/tour/TourStepIndicators'
import { TourStepContent } from '@/components/ai/tour/TourStepContent'
import { TourNavigationControls } from '@/components/ai/tour/TourNavigationControls'
import { useGuidedTourState, tourSteps } from '@/hooks/ai/useGuidedTourState'

export function AIGuidedTour() {
  const {
    currentStep,
    completedSteps,
    isCompleted,
    showTour,
    progress,
    currentStepData,
    handleNext,
    handlePrevious,
    handleClose
  } = useGuidedTourState()

  if (!showTour || isCompleted) {
    return null
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 mb-6">
      <CardHeader>
        <TourProgress
          currentStep={currentStep}
          totalSteps={tourSteps.length}
          progress={progress}
          onClose={handleClose}
        />
        
        <TourProgressBar progress={progress} />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <TourStepIndicators
          steps={tourSteps}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />

        <TourStepContent step={currentStepData} />

        <TourNavigationControls
          currentStep={currentStep}
          totalSteps={tourSteps.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onClose={handleClose}
        />
      </CardContent>
    </Card>
  )
}
