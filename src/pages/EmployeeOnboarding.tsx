import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import React from 'react'
import { 
  User, 
  MapPin, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Upload,
  Building
} from 'lucide-react'

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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Nombre *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Apellidos *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dni">DNI/NIE *</Label>
                <Input
                  id="dni"
                  value={formData.dni || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, dni: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="birth_date">Fecha de Nacimiento *</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nationality">Nacionalidad</Label>
                <Input
                  id="nationality"
                  value={formData.nationality || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                  placeholder="Española"
                />
              </div>
              <div>
                <Label htmlFor="social_security">Número Seguridad Social</Label>
                <Input
                  id="social_security"
                  value={formData.social_security || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, social_security: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Dirección Completa *</Label>
              <Textarea
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="postal_code">Código Postal *</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                  required
                />
              </div>
            </div>
            <Separator />
            <h3 className="font-medium">Contacto de Emergencia</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergency_contact_name">Nombre Contacto Emergencia</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact_phone">Teléfono Contacto Emergencia</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bank_name">Banco *</Label>
              <Input
                id="bank_name"
                value={formData.bank_name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="iban">IBAN *</Label>
              <Input
                id="iban"
                value={formData.iban || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
                placeholder="ES00 0000 0000 0000 0000 0000"
                required
              />
            </div>
            <div>
              <Label htmlFor="account_holder">Titular de la Cuenta *</Label>
              <Input
                id="account_holder"
                value={formData.account_holder || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, account_holder: e.target.value }))}
                required
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Sube aquí tus documentos (DNI, Curriculum, Certificados, etc.)
              </p>
              <Button variant="outline">
                Seleccionar Archivos
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Formatos admitidos: PDF, JPG, PNG. Tamaño máximo: 10MB por archivo.
            </p>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Resumen de tus datos</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Nombre:</span>
                  <span className="ml-2">{formData.first_name} {formData.last_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2">{onboardingData.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Puesto:</span>
                  <span className="ml-2">{onboardingData.position_title}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">DNI:</span>
                  <span className="ml-2">{formData.dni}</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="signature">Firma Digital *</Label>
              <Input
                id="signature"
                value={formData.signature || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, signature: e.target.value }))}
                placeholder="Escribe tu nombre completo como firma"
                required
              />
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms_accepted"
                checked={formData.terms_accepted || false}
                onChange={(e) => setFormData(prev => ({ ...prev, terms_accepted: e.target.checked }))}
                className="mt-1"
                required
              />
              <Label htmlFor="terms_accepted" className="text-sm">
                Acepto los términos y condiciones del contrato de trabajo y autorizo el tratamiento de mis datos personales según la política de privacidad de la empresa.
              </Label>
            </div>
          </div>
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
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">Paso {currentStep} de 5</span>
            <span className="text-sm text-muted-foreground">{Math.round((currentStep / 5) * 100)}% completado</span>
          </div>
          <Progress value={(currentStep / 5) * 100} className="h-2" />
        </div>

        {/* Steps indicator */}
        <div className="flex justify-between mb-8">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.number
            const isCompleted = currentStep > step.number

            return (
              <div key={step.number} className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-2
                  ${isCompleted ? 'bg-chart-2 text-white' : 
                    isActive ? 'bg-primary text-white' : 
                    'bg-muted text-muted-foreground'}
                `}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-xs text-center ${isActive ? 'font-medium' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
              </div>
            )
          })}
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

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={nextStep}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? 'Guardando...' : 'Siguiente'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={completeOnboarding}
              disabled={!formData.terms_accepted || !formData.signature}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Finalizar Onboarding
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}