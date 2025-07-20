
import React from 'react'
import type { OnboardingStep } from '@/types/onboarding'
import { useOnboarding } from '@/contexts/OnboardingContext'

interface OnboardingStepContentProps {
  step: OnboardingStep
  stepIndex: number
  stepData: any
  clientData: any
}

export function OnboardingStepContent({
  step,
  stepIndex,
  stepData,
  clientData
}: OnboardingStepContentProps) {
  const { updateStepData, updateClientData } = useOnboarding()

  if (!step) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Paso no encontrado</p>
      </div>
    )
  }

  const StepComponent = step.component

  const handleStepUpdate = (data: any) => {
    // Actualizar datos del paso específico
    updateStepData(step.id, data)
    
    // También actualizar datos del cliente si es información relevante
    updateClientData(data)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {step.title}
        </h3>
        <p className="text-gray-600">
          {step.description}
        </p>
      </div>

      <div className="bg-white border border-0.5 border-gray-200 rounded-[10px] p-4">
        <StepComponent
          stepData={stepData}
          clientData={clientData}
          onUpdate={handleStepUpdate}
        />
      </div>

      {step.isRequired && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-[10px]">
          <p className="text-sm text-blue-700">
            <strong>Paso obligatorio:</strong> Este paso es necesario para completar el onboarding.
          </p>
        </div>
      )}
    </div>
  )
}
