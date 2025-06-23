
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, ArrowLeft, Scale, CheckCircle, FileText, Euro } from 'lucide-react'
import { ClientSelectorWithProspect } from '@/components/proposals/ClientSelectorWithProspect'
import { LegalServiceSelector } from './LegalServiceSelector'
import { LegalRetainerConfigurator } from './LegalRetainerConfigurator'
import { ProposalConversionFeedback } from '@/components/proposals/ProposalConversionFeedback'

interface LegalProposalData {
  // Cliente
  clientId: string
  
  // Servicios
  selectedArea: string
  selectedServices: string[]
  
  // Configuración
  retainerConfig: {
    retainerAmount: number
    includedHours: number
    extraHourlyRate: number
    billingFrequency: 'monthly' | 'quarterly' | 'yearly'
    billingDay: number
    autoRenewal: boolean
    contractDuration: number
    paymentTerms: number
  }
  
  // Propuesta
  title: string
  introduction: string
  terms: string
  validityDays: number
}

const steps = [
  { id: 1, name: 'Cliente', description: 'Seleccionar cliente o prospecto' },
  { id: 2, name: 'Servicios', description: 'Área de práctica y servicios' },
  { id: 3, name: 'Honorarios', description: 'Configuración económica' },
  { id: 4, name: 'Propuesta', description: 'Contenido y términos' },
  { id: 5, name: 'Revisión', description: 'Confirmar y enviar' }
]

interface LegalProposalBuilderProps {
  onSave: (data: any) => void
  isSaving: boolean
  onBack: () => void
}

export const LegalProposalBuilder: React.FC<LegalProposalBuilderProps> = ({
  onSave,
  isSaving,
  onBack
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [proposalData, setProposalData] = useState<LegalProposalData>({
    clientId: '',
    selectedArea: '',
    selectedServices: [],
    retainerConfig: {
      retainerAmount: 300,
      includedHours: 8,
      extraHourlyRate: 75,
      billingFrequency: 'monthly',
      billingDay: 1,
      autoRenewal: true,
      contractDuration: 12,
      paymentTerms: 30
    },
    title: '',
    introduction: '',
    terms: '',
    validityDays: 30
  })

  const updateProposalData = (field: keyof LegalProposalData, value: any) => {
    setProposalData(prev => ({ ...prev, [field]: value }))
  }

  const getStepProgress = () => {
    return ((currentStep - 1) / (steps.length - 1)) * 100
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return proposalData.clientId !== ''
      case 2: return proposalData.selectedArea !== '' && proposalData.selectedServices.length > 0
      case 3: return proposalData.retainerConfig.retainerAmount > 0
      case 4: return proposalData.title !== ''
      case 5: return true
      default: return false
    }
  }

  const handleSave = () => {
    // Transform to the expected format
    const formattedData = {
      title: proposalData.title,
      clientId: proposalData.clientId,
      introduction: proposalData.introduction,
      scopeOfWork: `Servicios de ${proposalData.selectedArea}`,
      timeline: `Duración del contrato: ${proposalData.retainerConfig.contractDuration} meses`,
      pricingTiers: [{
        id: crypto.randomUUID(),
        name: `Plan ${proposalData.selectedArea}`,
        description: proposalData.introduction,
        services: [{
          id: crypto.randomUUID(),
          name: `Servicios ${proposalData.selectedArea}`,
          description: `Servicios recurrentes de ${proposalData.selectedArea}`,
          quantity: 1,
          unitPrice: proposalData.retainerConfig.retainerAmount,
          billingCycle: proposalData.retainerConfig.billingFrequency,
          taxable: true
        }],
        totalPrice: proposalData.retainerConfig.retainerAmount
      }],
      currency: 'EUR',
      validUntil: new Date(Date.now() + proposalData.validityDays * 24 * 60 * 60 * 1000),
      is_recurring: true,
      recurring_frequency: proposalData.retainerConfig.billingFrequency,
      contract_start_date: new Date(),
      auto_renewal: proposalData.retainerConfig.autoRenewal,
      retainer_amount: proposalData.retainerConfig.retainerAmount,
      included_hours: proposalData.retainerConfig.includedHours,
      hourly_rate_extra: proposalData.retainerConfig.extraHourlyRate,
      billing_day: proposalData.retainerConfig.billingDay
    }
    
    onSave(formattedData)
    setShowSuccess(true)
  }

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <ProposalConversionFeedback
          proposalTitle={proposalData.title}
          clientName="Cliente seleccionado"
          recurringAmount={proposalData.retainerConfig.retainerAmount}
          frequency={proposalData.retainerConfig.billingFrequency}
          onViewRecurringFee={() => {
            // Navigate to recurring fees
            console.log('Navigate to recurring fees')
          }}
        />
        <div className="mt-6 text-center">
          <Button onClick={onBack}>
            Volver a Propuestas
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header profesional */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl font-bold">
                  Nueva Propuesta de Servicios Jurídicos Recurrentes
                </CardTitle>
                <p className="text-blue-100">
                  Creación de propuesta profesional para servicios legales continuos
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white">
              Paso {currentStep} de {steps.length}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Progress indicator */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {steps[currentStep - 1].name}: {steps[currentStep - 1].description}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(getStepProgress())}% completado
              </span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
          </div>
          
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step.id <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className={`ml-2 text-sm ${
                  step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px bg-gray-200 mx-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step content */}
      <Card>
        <CardContent className="p-8">
          {currentStep === 1 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Selección de Cliente</h3>
              <ClientSelectorWithProspect
                selectedClientId={proposalData.clientId}
                onClientSelected={(clientId) => updateProposalData('clientId', clientId)}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Área de Práctica y Servicios</h3>
              <LegalServiceSelector
                selectedServices={proposalData.selectedServices}
                onServicesChange={(services) => updateProposalData('selectedServices', services)}
                onAreaChange={(area) => updateProposalData('selectedArea', area)}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Configuración de Honorarios</h3>
              <LegalRetainerConfigurator
                config={proposalData.retainerConfig}
                onConfigChange={(config) => updateProposalData('retainerConfig', config)}
                estimatedMonthlyHours={10}
              />
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Contenido de la Propuesta</h3>
              
              <div>
                <Label htmlFor="title">Título de la Propuesta</Label>
                <Input
                  id="title"
                  value={proposalData.title}
                  onChange={(e) => updateProposalData('title', e.target.value)}
                  placeholder="Ej: Servicios Jurídicos Integrales - Área Fiscal"
                />
              </div>

              <div>
                <Label htmlFor="introduction">Introducción</Label>
                <Textarea
                  id="introduction"
                  value={proposalData.introduction}
                  onChange={(e) => updateProposalData('introduction', e.target.value)}
                  rows={4}
                  placeholder="Presentación de los servicios jurídicos..."
                />
              </div>

              <div>
                <Label htmlFor="terms">Términos y Condiciones Adicionales</Label>
                <Textarea
                  id="terms"
                  value={proposalData.terms}
                  onChange={(e) => updateProposalData('terms', e.target.value)}
                  rows={3}
                  placeholder="Condiciones específicas del servicio..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validity">Validez de la Propuesta (días)</Label>
                  <Input
                    id="validity"
                    type="number"
                    value={proposalData.validityDays}
                    onChange={(e) => updateProposalData('validityDays', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Revisión Final</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Resumen de la Propuesta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium">Título:</span>
                      <p className="text-gray-600">{proposalData.title}</p>
                    </div>
                    <div>
                      <span className="font-medium">Área:</span>
                      <p className="text-gray-600">{proposalData.selectedArea}</p>
                    </div>
                    <div>
                      <span className="font-medium">Servicios:</span>
                      <p className="text-gray-600">{proposalData.selectedServices.length} seleccionados</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Euro className="h-5 w-5" />
                      Configuración Económica
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium">Cuota:</span>
                      <p className="text-gray-600">
                        {proposalData.retainerConfig.retainerAmount}€ {proposalData.retainerConfig.billingFrequency}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Horas incluidas:</span>
                      <p className="text-gray-600">{proposalData.retainerConfig.includedHours}h</p>
                    </div>
                    <div>
                      <span className="font-medium">Tarifa extra:</span>
                      <p className="text-gray-600">{proposalData.retainerConfig.extraHourlyRate}€/h</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onBack : () => setCurrentStep(prev => prev - 1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {currentStep === 1 ? 'Volver' : 'Anterior'}
        </Button>

        {currentStep < steps.length ? (
          <Button
            onClick={() => setCurrentStep(prev => prev + 1)}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            Siguiente
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            disabled={!canProceed() || isSaving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Crear Propuesta
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
