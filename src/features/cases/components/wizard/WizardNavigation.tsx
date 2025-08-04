import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react'

interface WizardNavigationProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  onCancel,
  isLoading
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <div className="flex justify-between items-center pt-6 border-t">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        
        {!isFirstStep && (
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        {!isLastStep ? (
          <Button
            onClick={onNext}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creando Expediente...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Crear Expediente
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}