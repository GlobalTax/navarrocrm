
import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { PROPOSAL_STEPS } from '@/types/proposals'

interface LegalProposalNavigationProps {
  currentStep: number
  onStepChange: (step: number) => void
  onSave: () => void
  onClose: () => void
  canProceed: boolean
  isSaving: boolean
  showSuccess: boolean
}

export const LegalProposalNavigation: React.FC<LegalProposalNavigationProps> = ({
  currentStep,
  onStepChange,
  onSave,
  onClose,
  canProceed,
  isSaving,
  showSuccess
}) => {
  const handlePrevious = () => {
    if (currentStep === 1) {
      onClose()
    } else {
      onStepChange(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (currentStep < PROPOSAL_STEPS.length) {
      onStepChange(currentStep + 1)
    }
  }

  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={handlePrevious}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        {currentStep === 1 ? 'Volver' : 'Anterior'}
      </Button>

      {currentStep < PROPOSAL_STEPS.length ? (
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex items-center gap-2"
        >
          Siguiente
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          onClick={onSave}
          disabled={!canProceed || isSaving}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Guardando...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Crear Propuesta
            </>
          )}
        </Button>
      )}
    </div>
  )
}
