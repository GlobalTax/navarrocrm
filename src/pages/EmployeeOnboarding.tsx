import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import React from 'react'
import { 
  User, 
  MapPin, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  Building,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { DocumentSigningStep } from '@/components/employee-onboarding/DocumentSigningStep'
import { EnhancedProgressBar } from '@/components/employee-onboarding/EnhancedProgressBar'
import { StepNavigation } from '@/components/employee-onboarding/StepNavigation'
import { PersonalDataStep } from '@/components/employee-onboarding/steps/PersonalDataStep'
import { ContactDataStep } from '@/components/employee-onboarding/steps/ContactDataStep'
import { BankingDataStep } from '@/components/employee-onboarding/steps/BankingDataStep'
import { DocumentsStep } from '@/components/employee-onboarding/steps/DocumentsStep'
import { FinalStep } from '@/components/employee-onboarding/steps/FinalStep'

interface OnboardingData {
  id: string
  email: string
  position_title: string
  current_step: number
  personal_data: Record<string, any>
  contact_data: Record<string, any>
  banking_data: Record<string, any>
  job_data: Record<string, any>
  documents: any[]
}

const STEPS = [
  { number: 1, title: 'Datos Personales', icon: User },
  { number: 2, title: 'Datos de Contacto', icon: MapPin },
  { number: 3, title: 'Datos Bancarios', icon: CreditCard },
  { number: 4, title: 'Documentos', icon: FileText },
  { number: 5, title: 'Firma y Finalización', icon: CheckCircle }
]

export default function EmployeeOnboarding() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  // Using toast from sonner
  const token = searchParams.get('token')

  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({})
  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({})

  useEffect(() => {
    if (token) {
      validateToken()
    } else {
      setIsLoading(false)
      toast.error("Token requerido", {
        description: "No se encontró un token válido en la URL"
      })
    }
  }, [token])

  const validateToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('employee-onboarding', {
        body: { action: 'validate_token', token }
      })

      if (error) throw error

      if (data.success) {
        setOnboardingData(data.onboarding)
        setCurrentStep(data.onboarding.current_step)
        // Cargar datos existentes
        setFormData({
          ...data.onboarding.personal_data,
          ...data.onboarding.contact_data,
          ...data.onboarding.banking_data,
          ...data.onboarding.job_data
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast.error("Token inválido", {
        description: error.message || "El enlace no es válido o ha expirado"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveStep = async (stepData: Record<string, any>) => {
    if (!token) return

    setIsSaving(true)
    try {
      const { data, error } = await supabase.functions.invoke('employee-onboarding', {
        body: { 
          action: 'update_step', 
          token, 
          step: currentStep,
          data: stepData
        }
      })

      if (error) throw error

      toast.success("Datos guardados", {
        description: "Los datos se han guardado correctamente"
      })

      return true
    } catch (error: any) {
      toast.error("Error", {
        description: error.message
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const nextStep = async () => {
    const success = await saveStep(getCurrentStepData())
    if (success && currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getCurrentStepData = () => {
    switch (currentStep) {
      case 1:
        return {
          first_name: formData.first_name || '',
          last_name: formData.last_name || '',
          dni: formData.dni || '',
          birth_date: formData.birth_date || '',
          nationality: formData.nationality || '',
          social_security: formData.social_security || ''
        }
      case 2:
        return {
          phone: formData.phone || '',
          address: formData.address || '',
          city: formData.city || '',
          postal_code: formData.postal_code || '',
          emergency_contact_name: formData.emergency_contact_name || '',
          emergency_contact_phone: formData.emergency_contact_phone || ''
        }
      case 3:
        return {
          bank_name: formData.bank_name || '',
          iban: formData.iban || '',
          account_holder: formData.account_holder || ''
        }
      case 4:
        return {
          documents: onboardingData?.documents || []
        }
      case 5:
        return {
          signature: formData.signature || '',
          terms_accepted: formData.terms_accepted || false
        }
      default:
        return {}
    }
  }

  const completeOnboarding = async () => {
    if (!token) return

    try {
      const { data, error } = await supabase.functions.invoke('employee-onboarding', {
        body: { action: 'complete_onboarding', token }
      })

      if (error) throw error

      toast.success("¡Onboarding completado!", {
        description: "Bienvenido al equipo. Recibirás un email con los siguientes pasos."
      })

      // Redirigir a página de éxito
      navigate('/employee-onboarding/success')
    } catch (error: any) {
      toast.error("Error", {
        description: error.message
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Validando enlace...</p>
        </div>
      </div>
    )
  }

  if (!onboardingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Enlace no válido</h1>
            <p className="text-muted-foreground">
              El enlace de onboarding no es válido o ha expirado.
              Contacta con el departamento de recursos humanos.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleStepDataChange = (stepNumber: number) => (data: any) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleStepValidationChange = (stepNumber: number) => (isValid: boolean, errors: string[]) => {
    setStepValidation(prev => ({ ...prev, [stepNumber]: isValid }))
    setStepErrors(prev => ({ ...prev, [stepNumber]: errors }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalDataStep
            data={formData}
            onDataChange={handleStepDataChange(1)}
            onValidationChange={handleStepValidationChange(1)}
            onSave={saveStep}
          />
        )
      case 2:
        return (
          <ContactDataStep
            data={formData}
            onDataChange={handleStepDataChange(2)}
            onValidationChange={handleStepValidationChange(2)}
            onSave={saveStep}
          />
        )
      case 3:
        return (
          <BankingDataStep
            data={formData}
            onDataChange={handleStepDataChange(3)}
            onValidationChange={handleStepValidationChange(3)}
            onSave={saveStep}
          />
        )
      case 4:
        return (
          <DocumentsStep
            data={{ ...formData, onboarding_id: onboardingData?.id }}
            onDataChange={handleStepDataChange(4)}
            onValidationChange={handleStepValidationChange(4)}
            onSave={saveStep}
          />
        )
      case 5:
        return (
          <FinalStep
            data={formData}
            onDataChange={handleStepDataChange(5)}
            onValidationChange={handleStepValidationChange(5)}
            onSave={saveStep}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Building className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Onboarding de Empleado</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenido/a {onboardingData.email} - {onboardingData.position_title}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Enhanced Progress */}
        <div className="mb-8">
          <EnhancedProgressBar
            steps={STEPS.map(step => ({ ...step, isRequired: [1, 2, 3, 5].includes(step.number) }))}
            currentStep={currentStep}
            completedSteps={completedSteps}
            stepValidation={stepValidation}
            errors={stepErrors}
          />
        </div>

        {/* Step content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(STEPS[currentStep - 1].icon, { className: "h-5 w-5" })}
              {STEPS[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Enhanced Navigation */}
        <div className="mt-8">
          <StepNavigation
            currentStep={currentStep}
            totalSteps={5}
            canGoNext={stepValidation[currentStep]}
            canGoPrevious={currentStep > 1}
            isLastStep={currentStep === 5}
            isLoading={isLoading}
            isSaving={isSaving}
            onPrevious={prevStep}
            onNext={nextStep}
            onComplete={completeOnboarding}
            errors={stepErrors[currentStep] || []}
          />
        </div>
      </div>
    </div>
  )
}