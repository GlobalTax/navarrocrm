
import { useState, useEffect } from 'react'
import { casesLogger } from '@/utils/logging'
import { WizardFormData, WizardStep } from './types'
import { CreateCaseData } from '@/hooks/cases/types'

const STEPS: WizardStep[] = [
  { id: 1, title: 'Información Básica', description: 'Contacto, título y área' },
  { id: 2, title: 'Configuración', description: 'Abogados y facturación' },
  { id: 3, title: 'Revisión', description: 'Confirmar y crear' }
]

const initialFormData: WizardFormData = {
  title: '',
  description: '',
  status: 'open',
  contact_id: '',
  practice_area: '',
  responsible_solicitor_id: '',
  originating_solicitor_id: '',
  billing_method: 'hourly',
  estimated_budget: undefined,
  template_selection: 'none'
}

export const useWizardState = (
  isSuccess?: boolean,
  onOpenChange?: (open: boolean) => void,
  onResetCreate?: () => void
) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<WizardFormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Close wizard when creation is successful
  useEffect(() => {
    if (isSuccess) {
      casesLogger.info('✅ Expediente creado exitosamente, cerrando wizard')
      handleClose()
    }
  }, [isSuccess])

  const updateFormData = (updates: Partial<WizardFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    // Clear errors for updated fields
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
      if (!formData.contact_id) {
        newErrors.contact_id = 'Debe seleccionar un contacto'
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

  const handleClose = () => {
    casesLogger.debug('🚪 Cerrando wizard y reseteando estado')
    
    // Reset form
    setCurrentStep(1)
    setFormData(initialFormData)
    setErrors({})
    
    // Reset creation state
    if (onResetCreate) {
      onResetCreate()
    }
    
    // Close modal
    if (onOpenChange) {
      onOpenChange(false)
    }
  }

  const prepareSubmitData = (): CreateCaseData => {
    return {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      contact_id: formData.contact_id,
      practice_area: formData.practice_area === 'none' ? undefined : formData.practice_area,
      responsible_solicitor_id: formData.responsible_solicitor_id === 'none' ? undefined : formData.responsible_solicitor_id,
      originating_solicitor_id: formData.originating_solicitor_id === 'none' ? undefined : formData.originating_solicitor_id,
      billing_method: formData.billing_method,
      estimated_budget: formData.estimated_budget
    }
  }

  return {
    currentStep,
    formData,
    errors,
    steps: STEPS,
    updateFormData,
    validateStep,
    handleNext,
    handlePrevious,
    handleClose,
    prepareSubmitData
  }
}
