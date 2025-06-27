
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react'

interface TemplateWizardNavigationProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function TemplateWizardNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  onCancel,
  isLoading
}: TemplateWizardNavigationProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <div className="flex justify-between items-center pt-6 border-t bg-white">
      <div className="flex gap-3">
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

      <div className="flex items-center gap-2 text-sm text-gray-500">
        Paso {currentStep} de {totalSteps}
      </div>

      <div className="flex gap-3">
        {!isLastStep ? (
          <Button
            onClick={onNext}
            disabled={isLoading}
            className="flex items-center gap-2 px-6"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-8 bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Crear Plantilla
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
