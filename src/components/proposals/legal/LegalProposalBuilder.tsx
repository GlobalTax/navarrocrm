
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LegalProposalHeader } from './components/LegalProposalHeader'
import { LegalProposalNavigation } from './components/LegalProposalNavigation'
import { LegalProposalStepContent } from './components/LegalProposalStepContent'
import { LegalProposalProgressBar } from './components/LegalProposalProgressBar'
import { useLegalProposalState } from './hooks/useLegalProposalState'
import type { ProposalFormData } from '@/types/proposals/forms'

interface LegalProposalBuilderProps {
  onClose: () => void
  onSave: (data: ProposalFormData) => void
  isSaving?: boolean
}

export const LegalProposalBuilder: React.FC<LegalProposalBuilderProps> = ({
  onClose,
  onSave,
  isSaving = false
}) => {
  const {
    proposalData,
    updateProposalData,
    currentStep,
    setCurrentStep,
    showSuccess,
    canProceed,
    handleAreaChange,
    handleServiceToggle,
    handleServiceUpdate,
    handleServiceRemove,
    selectedServiceIds,
    practiceAreasData
  } = useLegalProposalState()

  const handleSave = () => {
    // Convertir LegalProposalData a ProposalFormData
    const convertedData: ProposalFormData = {
      clientId: proposalData.clientId,
      title: proposalData.title,
      introduction: proposalData.introduction,
      terms: proposalData.terms,
      validityDays: proposalData.validityDays,
      selectedServices: proposalData.selectedServices.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        basePrice: service.basePrice,
        customPrice: service.customPrice,
        quantity: service.quantity,
        billingUnit: service.billingUnit,
        estimatedHours: service.estimatedHours,
        total: service.total
      })),
      is_recurring: true, // Las propuestas legales son típicamente recurrentes
      recurring_frequency: proposalData.retainerConfig.billingFrequency === 'monthly' ? 'monthly' : 
                          proposalData.retainerConfig.billingFrequency === 'quarterly' ? 'quarterly' : 'yearly',
      retainerConfig: proposalData.retainerConfig,
      currency: 'EUR',
      selectedArea: proposalData.selectedArea
    }
    onSave(convertedData)
  }

  const handleServiceAdd = () => {
    // Implementation for adding custom services
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <LegalProposalHeader 
              currentStep={currentStep}
              onClose={onClose} 
            />
            
            <div className="p-6">
              <LegalProposalProgressBar 
                currentStep={currentStep}
              />
              
              <div className="mt-8">
                <LegalProposalStepContent
                  currentStep={currentStep}
                  proposalData={proposalData}
                  updateProposalData={updateProposalData}
                  selectedServiceIds={selectedServiceIds}
                  onAreaChange={handleAreaChange}
                  onServiceToggle={handleServiceToggle}
                  onServiceUpdate={handleServiceUpdate}
                  onServiceRemove={handleServiceRemove}
                  onServiceAdd={handleServiceAdd}
                  practiceAreasData={practiceAreasData}
                />
              </div>
              
              <LegalProposalNavigation
                currentStep={currentStep}
                onStepChange={setCurrentStep}
                onSave={handleSave}
                onClose={onClose}
                canProceed={canProceed()}
                isSaving={isSaving}
                showSuccess={showSuccess}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
