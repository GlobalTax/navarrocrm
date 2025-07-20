
import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X, SkipForward } from 'lucide-react'
import { useOnboarding } from '@/contexts/OnboardingContext'

interface OnboardingNavigationProps {
  currentStepIndex: number
  totalSteps: number
  canGoNext: boolean
  canGoPrevious: boolean
  allowSkip: boolean
  isLastStep: boolean
}

export function OnboardingNavigation({
  currentStepIndex,
  totalSteps,
  canGoNext,
  canGoPrevious,
  allowSkip,
  isLastStep
}: OnboardingNavigationProps) {
  const {
    nextStep,
    previousStep,
    skipStep,
    completeOnboarding,
    cancelOnboarding,
    isLoading
  } = useOnboarding()

  const handleNext = () => {
    if (isLastStep) {
      completeOnboarding()
    } else {
      nextStep()
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={cancelOnboarding}
          className="border-0.5 border-black rounded-[10px]"
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        
        {allowSkip && !isLastStep && (
          <Button
            variant="ghost"
            onClick={skipStep}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Saltar
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={previousStep}
          disabled={!canGoPrevious || isLoading}
          className="border-0.5 border-black rounded-[10px]"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canGoNext || isLoading}
          className="border-0.5 border-black rounded-[10px]"
        >
          {isLastStep ? 'Completar' : 'Siguiente'}
          {!isLastStep && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  )
}
