
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { TemplateWizardStep1 } from './TemplateWizardStep1'
import { TemplateWizardStep2 } from './TemplateWizardStep2'
import { TemplateWizardStep3 } from './TemplateWizardStep3'
import { TemplateWizardStep4 } from './TemplateWizardStep4'
import { TemplateWizardStep5 } from './TemplateWizardStep5'
import { TemplateWizardNavigation } from './TemplateWizardNavigation'
import { CreateAdvancedTemplateData, AdvancedTemplateData } from '@/types/templateTypes'

interface TemplateWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateAdvancedTemplateData) => void
  isCreating: boolean
}

const WIZARD_STEPS = [
  { id: 1, title: 'Información Básica', description: 'Nombre, categoría y configuración general' },
  { id: 2, title: 'Facturación Avanzada', description: 'Tarifas, presupuestos y gastos típicos' },
  { id: 3, title: 'Etapas del Proceso', description: 'Fases del expediente y plazos' },
  { id: 4, title: 'Tareas Automáticas', description: 'Checklist y asignaciones' },
  { id: 5, title: 'Documentos y Comunicaciones', description: 'Plantillas y notificaciones' }
]

const initialTemplateData: AdvancedTemplateData = {
  icon: 'FileText',
  color: '#0061FF',
  category: 'general',
  tags: [],
  complexity: 'basic',
  estimated_duration_days: 30,
  stages: [],
  tasks: [],
  billing: {
    method: 'hourly',
    hourly_rates: {},
    estimated_hours_total: 0,
    estimated_hours_by_stage: {},
    typical_expenses: []
  },
  documents: [],
  email_templates: [],
  auto_communications: true,
  client_portal_access: true
}

export function TemplateWizard({ open, onOpenChange, onSubmit, isCreating }: TemplateWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    practice_area_id: 'none',
    default_billing_method: 'hourly',
    template_data: initialTemplateData
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates)
    setErrors(prev => {
      const newErrors = { ...prev }
      updatedFields.forEach(field => delete newErrors[field])
      return newErrors
    })
  }

  const updateTemplateData = (updates: Partial<AdvancedTemplateData>) => {
    setFormData(prev => ({
      ...prev,
      template_data: { ...prev.template_data, ...updates }
    }))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'El nombre es obligatorio'
      }
      if (!formData.template_data.category) {
        newErrors.category = 'La categoría es obligatoria'
      }
    }

    if (step === 2) {
      if (formData.template_data.billing.estimated_hours_total <= 0) {
        newErrors.billing = 'Debe especificar las horas estimadas'
      }
    }

    if (step === 3) {
      if (formData.template_data.stages.length === 0) {
        newErrors.stages = 'Debe definir al menos una etapa'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = () => {
    if (!validateStep(currentStep)) return

    const submitData: CreateAdvancedTemplateData = {
      name: formData.name,
      description: formData.description,
      practice_area_id: formData.practice_area_id === 'none' ? undefined : formData.practice_area_id,
      default_billing_method: formData.default_billing_method,
      template_data: formData.template_data
    }

    onSubmit(submitData)
  }

  const handleClose = () => {
    setCurrentStep(1)
    setFormData({
      name: '',
      description: '',
      practice_area_id: 'none',
      default_billing_method: 'hourly',
      template_data: initialTemplateData
    })
    setErrors({})
    onOpenChange(false)
  }

  const progressPercentage = (currentStep / WIZARD_STEPS.length) * 100

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Crear Plantilla Avanzada - {WIZARD_STEPS[currentStep - 1].title}
          </DialogTitle>
          <div className="space-y-3">
            <Progress value={progressPercentage} className="w-full h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              {WIZARD_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 ${
                    currentStep === step.id ? 'text-primary font-medium' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <span className="hidden md:block">{step.title}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {WIZARD_STEPS[currentStep - 1].description}
            </p>
          </div>
        </DialogHeader>

        <div className="mt-8">
          {currentStep === 1 && (
            <TemplateWizardStep1
              formData={formData}
              updateFormData={updateFormData}
              updateTemplateData={updateTemplateData}
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <TemplateWizardStep2
              formData={formData}
              updateTemplateData={updateTemplateData}
              errors={errors}
            />
          )}

          {currentStep === 3 && (
            <TemplateWizardStep3
              formData={formData}
              updateTemplateData={updateTemplateData}
              errors={errors}
            />
          )}

          {currentStep === 4 && (
            <TemplateWizardStep4
              formData={formData}
              updateTemplateData={updateTemplateData}
              errors={errors}
            />
          )}

          {currentStep === 5 && (
            <TemplateWizardStep5
              formData={formData}
              updateTemplateData={updateTemplateData}
              onSubmit={handleSubmit}
              isCreating={isCreating}
            />
          )}
        </div>

        <TemplateWizardNavigation
          currentStep={currentStep}
          totalSteps={WIZARD_STEPS.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isLoading={isCreating}
        />
      </DialogContent>
    </Dialog>
  )
}
