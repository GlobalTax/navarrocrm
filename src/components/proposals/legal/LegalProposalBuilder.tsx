
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LegalProposalHeader } from './components/LegalProposalHeader'
import { LegalProposalNavigation } from './components/LegalProposalNavigation'
import { LegalProposalStepContent } from './components/LegalProposalStepContent'
import { LegalProposalProgressBar } from './components/LegalProposalProgressBar'
import { useLegalProposalState } from './hooks/useLegalProposalState'

interface LegalProposalBuilderProps {
  onClose: () => void
  onSave: (data: any) => void
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
    handleAreaAndServicesChange,
    handleServiceToggle,
    handleServiceUpdate,
    handleServiceRemove,
    handleServiceAdd,
    practiceAreasData
  } = useLegalProposalState()

  console.log('LegalProposalBuilder render:', {
    currentStep,
    selectedArea: proposalData.selectedArea,
    selectedServices: proposalData.selectedServices?.length || 0
  })

  const handleSave = () => {
    console.log('Saving proposal data:', proposalData)
    onSave(proposalData)
  }

  // Convertir selectedServices a array de IDs para el selector
  const selectedServiceIds = proposalData.selectedServices?.map(s => s.id) || []

  // Evaluar canProceed como boolean
  const canProceedValue = typeof canProceed === 'function' ? canProceed() : canProceed

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
                totalSteps={5}
              />
              
              <div className="mt-8">
                <LegalProposalStepContent
                  currentStep={currentStep}
                  proposalData={proposalData}
                  selectedServiceIds={selectedServiceIds}
                  onAreaAndServicesChange={handleAreaAndServicesChange}
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
                canProceed={canProceedValue}
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
