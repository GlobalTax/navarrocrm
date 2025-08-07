
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { WizardStep1 } from './WizardStep1'
import { WizardStep2 } from './WizardStep2'
import { WizardStep3 } from './WizardStep3'
import { WizardNavigation } from './WizardNavigation'
import { MatterWizardProps } from './types'
import { useWizardState } from './useWizardState'

export function MatterWizard({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isLoading,
  isSuccess,
  onResetCreate
}: MatterWizardProps) {
  const {
    currentStep,
    formData,
    errors,
    steps,
    updateFormData,
    validateStep,
    handleNext,
    handlePrevious,
    handleClose,
    prepareSubmitData
  } = useWizardState(isSuccess, onOpenChange, onResetCreate)

  const handleSubmit = () => {
    if (!validateStep(currentStep)) return

    const submitData = prepareSubmitData()
    onSubmit(submitData)
  }

  const progressPercentage = (currentStep / steps.length) * 100

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Nuevo Expediente - {steps[currentStep - 1].title}
          </DialogTitle>
          <div className="space-y-2">
            <Progress value={progressPercentage} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Paso {currentStep} de {steps.length}: {steps[currentStep - 1].description}
            </p>
          </div>
        </DialogHeader>

        <div className="mt-6">
          {currentStep === 1 && (
            <WizardStep1 
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
            />
          )}
          
          {currentStep === 2 && (
            <WizardStep2 
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
            />
          )}
          
          {currentStep === 3 && (
            <WizardStep3 
              formData={formData}
            />
          )}
        </div>

        <WizardNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
