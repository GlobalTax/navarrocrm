import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Save, CheckCircle, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  canGoNext: boolean
  canGoPrevious: boolean
  isLastStep: boolean
  isLoading: boolean
  isSaving: boolean
  onPrevious: () => void
  onNext: () => void
  onComplete: () => void
  onSaveAsDraft?: () => void
  errors?: string[]
  warnings?: string[]
}

export function StepNavigation({
  currentStep,
  totalSteps,
  canGoNext,
  canGoPrevious,
  isLastStep,
  isLoading,
  isSaving,
  onPrevious,
  onNext,
  onComplete,
  onSaveAsDraft,
  errors = [],
  warnings = []
}: StepNavigationProps) {
  const hasErrors = errors.length > 0
  const hasWarnings = warnings.length > 0

  return (
    <div className="space-y-4">
      {/* Error y Warning Messages */}
      {(hasErrors || hasWarnings) && (
        <div className="space-y-2">
          {hasErrors && (
            <div className="bg-red-50 border border-red-200 rounded-[10px] p-4">
              <div className="flex items-start gap-2">
                <div className="text-red-600">
                  <div className="h-5 w-5 rounded-full bg-red-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">
                    Errores que requieren corrección:
                  </h4>
                  <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {hasWarnings && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-[10px] p-4">
              <div className="flex items-start gap-2">
                <div className="text-yellow-600">
                  <div className="h-5 w-5 rounded-full bg-yellow-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">
                    Recomendaciones:
                  </h4>
                  <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                    {warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious || isLoading}
            className="border-0.5 border-gray-300 rounded-[10px] hover:scale-105 transition-transform"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {/* Save as Draft Button */}
          {onSaveAsDraft && (
            <Button
              variant="ghost"
              onClick={onSaveAsDraft}
              disabled={isLoading}
              className="text-gray-600 hover:text-gray-800"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Borrador
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Step Counter */}
          <Badge variant="outline" className="px-3 py-1">
            {currentStep} de {totalSteps}
          </Badge>

          {/* Next/Complete Button */}
          {isLastStep ? (
            <Button
              onClick={onComplete}
              disabled={hasErrors || isLoading || isSaving}
              className="border-0.5 border-black rounded-[10px] hover:scale-105 transition-transform"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Completando...' : 'Finalizar Onboarding'}
            </Button>
          ) : (
            <Button
              onClick={onNext}
              disabled={!canGoNext || isLoading || isSaving}
              className="border-0.5 border-black rounded-[10px] hover:scale-105 transition-transform"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <>
                  {isSaving ? 'Guardando...' : 'Siguiente'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          {isLastStep 
            ? 'Revisa la información y completa tu incorporación'
            : hasErrors 
              ? 'Corrige los errores para continuar'
              : hasWarnings
                ? 'Puedes continuar, pero revisa las recomendaciones'
                : 'Continúa al siguiente paso cuando estés listo'
          }
        </p>
      </div>
    </div>
  )
}