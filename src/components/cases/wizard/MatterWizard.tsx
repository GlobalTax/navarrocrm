
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { WizardStep1 } from './WizardStep1'
import { WizardStep2 } from './WizardStep2'
import { WizardStep3 } from './WizardStep3'
import { WizardNavigation } from './WizardNavigation'
import { CreateCaseData } from '@/hooks/useCases'

export interface WizardFormData extends CreateCaseData {
  template_selection: string
}

interface MatterWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateCaseData) => void
  isLoading?: boolean
  isSuccess?: boolean
  onResetCreate?: () => void
}

const STEPS = [
  { id: 1, title: 'Información Básica', description: 'Cliente, título y área' },
  { id: 2, title: 'Configuración', description: 'Abogados y facturación' },
  { id: 3, title: 'Revisión', description: 'Confirmar y crear' }
]

export function MatterWizard({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isLoading,
  isSuccess,
  onResetCreate
}: MatterWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<WizardFormData>({
    title: '',
    description: '',
    status: 'open',
    client_id: '',
    practice_area: '',
    responsible_solicitor_id: '',
    originating_solicitor_id: '',
    billing_method: 'hourly',
    estimated_budget: undefined,
    template_selection: 'none'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cerrar la ventana cuando la creación sea exitosa
  useEffect(() => {
    if (isSuccess) {
      console.log('✅ Expediente creado exitosamente, cerrando wizard')
      handleClose()
    }
  }, [isSuccess])

  const updateFormData = (updates: Partial<WizardFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    // Limpiar errores de los campos actualizados
    const updatedFields = Object.keys(updates)
    setErrors(prev => {
      const newErrors = { ...prev }
      updatedFields.forEach(field => delete newErrors[field])
      return newErrors
    })
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'El título es obligatorio'
      }
      if (!formData.client_id) {
        newErrors.client_id = 'Debe seleccionar un cliente'
      }
    }

    if (step === 2) {
      if (!formData.billing_method) {
        newErrors.billing_method = 'Debe seleccionar un método de facturación'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = () => {
    if (!validateStep(currentStep)) return

    const submitData: CreateCaseData = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      client_id: formData.client_id,
      practice_area: formData.practice_area === 'none' ? undefined : formData.practice_area,
      responsible_solicitor_id: formData.responsible_solicitor_id === 'none' ? undefined : formData.responsible_solicitor_id,
      originating_solicitor_id: formData.originating_solicitor_id === 'none' ? undefined : formData.originating_solicitor_id,
      billing_method: formData.billing_method,
      estimated_budget: formData.estimated_budget
    }
    
    console.log('📤 Enviando datos del expediente:', submitData)
    onSubmit(submitData)
  }

  const handleClose = () => {
    console.log('🚪 Cerrando wizard y reseteando estado')
    
    // Reset del formulario
    setCurrentStep(1)
    setFormData({
      title: '',
      description: '',
      status: 'open',
      client_id: '',
      practice_area: '',
      responsible_solicitor_id: '',
      originating_solicitor_id: '',
      billing_method: 'hourly',
      estimated_budget: undefined,
      template_selection: 'none'
    })
    setErrors({})
    
    // Reset del estado de creación
    if (onResetCreate) {
      onResetCreate()
    }
    
    // Cerrar el modal
    onOpenChange(false)
  }

  const progressPercentage = (currentStep / STEPS.length) * 100

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Nuevo Expediente - {STEPS[currentStep - 1].title}
          </DialogTitle>
          <div className="space-y-2">
            <Progress value={progressPercentage} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Paso {currentStep} de {STEPS.length}: {STEPS[currentStep - 1].description}
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
          totalSteps={STEPS.length}
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
