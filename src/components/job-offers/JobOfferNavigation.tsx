import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Save } from 'lucide-react'

interface JobOfferNavigationProps {
  currentStep: number
  totalSteps: number
  canProceed: boolean
  isLastStep: boolean
  isSaving: boolean
  onPrevious: () => void
  onNext: () => void
  onSave: () => void
}

export function JobOfferNavigation({
  currentStep,
  totalSteps,
  canProceed,
  isLastStep,
  isSaving,
  onPrevious,
  onNext,
  onSave
}: JobOfferNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        Paso {currentStep + 1} de {totalSteps}
      </div>

      <div className="flex items-center gap-2">
        {isLastStep ? (
          <Button
            onClick={onSave}
            disabled={!canProceed || isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Crear Oferta'}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="flex items-center gap-2"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}