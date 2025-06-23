
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, ArrowLeft, Scale, CheckCircle } from 'lucide-react'
import { ClientSelectorWithProspect } from '@/components/proposals/ClientSelectorWithProspect'
import { LegalServiceSelector } from './LegalServiceSelector'
import { LegalServiceManager } from './LegalServiceManager'
import { LegalRetainerConfigurator } from './LegalRetainerConfigurator'
import { LegalProposalTexts } from './LegalProposalTexts'
import { LegalProposalPreview } from './LegalProposalPreview'
import { ProposalConversionFeedback } from '@/components/proposals/ProposalConversionFeedback'

interface SelectedService {
  id: string
  name: string
  description: string
  basePrice: number
  customPrice: number
  quantity: number
  billingUnit: string
  estimatedHours?: number
  total: number
}

interface LegalProposalData {
  clientId: string
  selectedArea: string
  selectedServices: SelectedService[]
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
  title: string
  introduction: string
  terms: string
  validityDays: number
}

const steps = [
  { id: 1, name: 'Cliente', description: 'Seleccionar cliente o prospecto' },
  { id: 2, name: 'Servicios', description: 'Selección y configuración' },
  { id: 3, name: 'Honorarios', description: 'Configuración económica' },
  { id: 4, name: 'Contenido', description: 'Textos de la propuesta' },
  { id: 5, name: 'Revisión', description: 'Vista previa y envío' }
]

// Data de servicios disponibles por área
const practiceAreasData = {
  fiscal: {
    name: 'Fiscal y Tributario',
    services: [
      {
        id: 'fiscal-1',
        name: 'Asesoría Fiscal Mensual',
        description: 'Gestión integral de obligaciones fiscales y tributarias',
        basePrice: 150,
        billingUnit: 'mes',
        estimatedHours: 8
      },
      {
        id: 'fiscal-2',
        name: 'Declaraciones Trimestrales',
        description: 'IVA, IRPF, Retenciones y otros impuestos periódicos',
        basePrice: 80,
        billingUnit: 'trimestre',
        estimatedHours: 4
      },
      {
        id: 'fiscal-3',
        name: 'Renta Anual',
        description: 'Declaración anual de la renta y patrimonio',
        basePrice: 200,
        billingUnit: 'año',
        estimatedHours: 6
      }
    ]
  },
  laboral: {
    name: 'Laboral y Seguridad Social',
    services: [
      {
        id: 'laboral-1',
        name: 'Asesoría Laboral Integral',
        description: 'Gestión de nóminas, contratos y Seguridad Social',
        basePrice: 120,
        billingUnit: 'mes',
        estimatedHours: 10
      },
      {
        id: 'laboral-2',
        name: 'Gestión de Nóminas',
        description: 'Elaboración mensual de nóminas y seguros sociales',
        basePrice: 15,
        billingUnit: 'empleado/mes',
        estimatedHours: 1
      },
      {
        id: 'laboral-3',
        name: 'Representación Legal Laboral',
        description: 'Defensa en procedimientos laborales y Inspección',
        basePrice: 300,
        billingUnit: 'mes',
        estimatedHours: 5
      }
    ]
  },
  mercantil: {
    name: 'Mercantil y Societario',
    services: [
      {
        id: 'mercantil-1',
        name: 'Asesoría Societaria',
        description: 'Gestión de sociedades, juntas y documentación social',
        basePrice: 200,
        billingUnit: 'mes',
        estimatedHours: 6
      },
      {
        id: 'mercantil-2',
        name: 'Compliance Corporativo',
        description: 'Cumplimiento normativo y gobierno corporativo',
        basePrice: 400,
        billingUnit: 'mes',
        estimatedHours: 8
      }
    ]
  },
  civil: {
    name: 'Civil y Patrimonial',
    services: [
      {
        id: 'civil-1',
        name: 'Asesoría Patrimonial',
        description: 'Gestión integral del patrimonio familiar y empresarial',
        basePrice: 250,
        billingUnit: 'mes',
        estimatedHours: 5
      }
    ]
  }
}

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

  console.log('Current proposal data:', proposalData)

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

  // Función para convertir IDs de servicios a objetos SelectedService completos
  const convertServiceIdsToSelectedServices = (serviceIds: string[], areaId: string): SelectedService[] => {
    const areaData = practiceAreasData[areaId as keyof typeof practiceAreasData]
    if (!areaData) {
      console.log('Area not found:', areaId)
      return []
    }

    const convertedServices = serviceIds.map(serviceId => {
      const serviceData = areaData.services.find(s => s.id === serviceId)
      if (!serviceData) {
        console.log('Service not found:', serviceId)
        return null
      }

      const selectedService: SelectedService = {
        id: serviceData.id,
        name: serviceData.name,
        description: serviceData.description,
        basePrice: serviceData.basePrice,
        customPrice: serviceData.basePrice, // Inicialmente igual al precio base
        quantity: 1,
        billingUnit: serviceData.billingUnit,
        estimatedHours: serviceData.estimatedHours,
        total: serviceData.basePrice * 1 // quantity * customPrice
      }

      return selectedService
    }).filter(Boolean) as SelectedService[]

    console.log('Converted services:', convertedServices)
    return convertedServices
  }

  const handleServicesChange = (serviceIds: string[]) => {
    console.log('Services changed:', serviceIds, 'Area:', proposalData.selectedArea)
    
    if (proposalData.selectedArea) {
      const convertedServices = convertServiceIdsToSelectedServices(serviceIds, proposalData.selectedArea)
      setProposalData(prev => ({ ...prev, selectedServices: convertedServices }))
    }
  }

  const handleAreaChange = (areaId: string) => {
    console.log('Area changed:', areaId)
    // Al cambiar el área, resetear los servicios seleccionados
    setProposalData(prev => ({ 
      ...prev, 
      selectedArea: areaId,
      selectedServices: []
    }))
  }

  const handleServiceUpdate = (serviceId: string, field: keyof SelectedService, value: number) => {
    console.log('Updating service:', serviceId, field, value)
    const updatedServices = proposalData.selectedServices.map(service => {
      if (service.id === serviceId) {
        const updated = { ...service, [field]: value }
        // Recalcular el total cuando cambie quantity o customPrice
        if (field === 'quantity' || field === 'customPrice') {
          updated.total = updated.quantity * updated.customPrice
        }
        return updated
      }
      return service
    })
    setProposalData(prev => ({ ...prev, selectedServices: updatedServices }))
  }

  const handleServiceRemove = (serviceId: string) => {
    console.log('Removing service:', serviceId)
    const updatedServices = proposalData.selectedServices.filter(service => service.id !== serviceId)
    setProposalData(prev => ({ ...prev, selectedServices: updatedServices }))
  }

  const handleServiceAdd = () => {
    console.log('Add new service - would open service selector')
    // Volver al selector de servicios
    setCurrentStep(2)
  }

  const handleGeneratePDF = () => {
    console.log('Generate PDF')
    // TODO: Implement PDF generation
  }

  const handleSendProposal = () => {
    handleSave()
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
    
    console.log('Saving proposal with data:', formattedData)
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
    <div className="max-w-6xl mx-auto space-y-6">
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
                onClientSelected={(clientId) => setProposalData(prev => ({ ...prev, clientId }))}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-6">Selección y Configuración de Servicios</h3>
              
              <LegalServiceSelector
                selectedServices={proposalData.selectedServices.map(s => s.id)}
                onServicesChange={handleServicesChange}
                onAreaChange={handleAreaChange}
              />

              {proposalData.selectedServices.length > 0 && (
                <LegalServiceManager
                  selectedServices={proposalData.selectedServices}
                  onServiceUpdate={handleServiceUpdate}
                  onServiceRemove={handleServiceRemove}
                  onServiceAdd={handleServiceAdd}
                />
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Configuración de Honorarios</h3>
              <LegalRetainerConfigurator
                config={proposalData.retainerConfig}
                onConfigChange={(config) => setProposalData(prev => ({ ...prev, retainerConfig: config }))}
                estimatedMonthlyHours={10}
              />
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <LegalProposalTexts
                introduction={proposalData.introduction}
                onIntroductionChange={(value) => setProposalData(prev => ({ ...prev, introduction: value }))}
                terms={proposalData.terms}
                onTermsChange={(value) => setProposalData(prev => ({ ...prev, terms: value }))}
                practiceArea={proposalData.selectedArea}
              />
              
              <div className="mt-6">
                <Label htmlFor="title">Título de la Propuesta</Label>
                <Input
                  id="title"
                  value={proposalData.title}
                  onChange={(e) => setProposalData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Servicios Jurídicos Integrales - Área Fiscal"
                />
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <LegalProposalPreview
              title={proposalData.title}
              clientName="Cliente seleccionado"
              practiceArea={proposalData.selectedArea}
              introduction={proposalData.introduction}
              terms={proposalData.terms}
              selectedServices={proposalData.selectedServices}
              retainerConfig={proposalData.retainerConfig}
              validityDays={proposalData.validityDays}
              onGeneratePDF={handleGeneratePDF}
              onSendProposal={handleSendProposal}
            />
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
