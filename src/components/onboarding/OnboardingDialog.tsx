
import React from 'react'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { OnboardingProgress } from './OnboardingProgress'
import { OnboardingNavigation } from './OnboardingNavigation'
import { OnboardingStepContent } from './OnboardingStepContent'
import { useOnboarding } from '@/contexts/OnboardingContext'

export function OnboardingDialog() {
  const {
    isActive,
    currentFlow,
    progress,
    showProgress,
    cancelOnboarding
  } = useOnboarding()

  if (!isActive || !currentFlow || !progress) {
    return null
  }

  const currentStep = currentFlow.steps[progress.currentStepIndex]
  const progressPercentage = ((progress.currentStepIndex + 1) / currentFlow.steps.length) * 100

  return (
    <Dialog open={isActive} onOpenChange={() => cancelOnboarding()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden border-0.5 border-black rounded-[10px]">
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentFlow.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {currentFlow.description}
              </p>
            </div>
            
            {showProgress && (
              <OnboardingProgress
                currentStep={progress.currentStepIndex + 1}
                totalSteps={currentFlow.steps.length}
                percentage={progressPercentage}
                completedSteps={progress.completedSteps}
              />
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <OnboardingStepContent
            step={currentStep}
            stepIndex={progress.currentStepIndex}
            stepData={progress.stepData[currentStep?.id] || {}}
            clientData={{}}
          />
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <OnboardingNavigation
            currentStepIndex={progress.currentStepIndex}
            totalSteps={currentFlow.steps.length}
            canGoNext={true}
            canGoPrevious={progress.currentStepIndex > 0}
            allowSkip={false}
            isLastStep={progress.currentStepIndex === currentFlow.steps.length - 1}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
