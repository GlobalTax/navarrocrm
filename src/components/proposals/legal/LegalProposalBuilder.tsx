
import React from 'react'
import { useLegalProposalState } from './hooks/useLegalProposalState'
import { LegalProposalHeader } from './components/LegalProposalHeader'
import { LegalProposalProgressBar } from './components/LegalProposalProgressBar'
import { LegalProposalStepContent } from './components/LegalProposalStepContent'
import { LegalProposalNavigation } from './components/LegalProposalNavigation'
import { ProposalConversionFeedback } from '@/components/proposals/ProposalConversionFeedback'
import { Button } from '@/components/ui/button'

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
  const {
    currentStep,
    setCurrentStep,
    showSuccess,
    setShowSuccess,
    proposalData,
    canProceed,
    handleAreaAndServicesChange,
    handleServiceUpdate,
    handleServiceRemove,
    handleServiceAdd,
    updateProposalData
  } = useLegalProposalState()

  console.log('LegalProposalBuilder - Current proposal data:', proposalData)

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
      <LegalProposalHeader currentStep={currentStep} />
      
      <LegalProposalProgressBar currentStep={currentStep} />

      <LegalProposalStepContent
        currentStep={currentStep}
        proposalData={proposalData}
        onClientSelected={(clientId) => updateProposalData('clientId', clientId)}
        onAreaAndServicesChange={handleAreaAndServicesChange}
        onServiceUpdate={handleServiceUpdate}
        onServiceRemove={handleServiceRemove}
        onServiceAdd={handleServiceAdd}
        onRetainerConfigChange={(config) => updateProposalData('retainerConfig', config)}
        onProposalDataChange={updateProposalData}
        onGeneratePDF={handleGeneratePDF}
        onSendProposal={handleSendProposal}
      />

      <LegalProposalNavigation
        currentStep={currentStep}
        canProceed={canProceed()}
        isSaving={isSaving}
        onPrevious={currentStep === 1 ? onBack : () => setCurrentStep(prev => prev - 1)}
        onNext={() => setCurrentStep(prev => prev + 1)}
        onSave={handleSave}
      />
    </div>
  )
}
