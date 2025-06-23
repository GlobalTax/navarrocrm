
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ClientSelectorWithProspect } from '@/components/proposals/ClientSelectorWithProspect'
import { LegalServiceSelector } from '../LegalServiceSelector'
import { LegalServiceManager } from '../LegalServiceManager'
import { LegalRetainerConfigurator } from '../LegalRetainerConfigurator'
import { LegalProposalTexts } from '../LegalProposalTexts'
import { LegalProposalPreview } from '../LegalProposalPreview'
import { LegalProposalData, SelectedService } from '../types/legalProposal.types'

interface LegalProposalStepContentProps {
  currentStep: number
  proposalData: LegalProposalData
  onClientSelected: (clientId: string) => void
  onAreaAndServicesChange: (areaId: string, serviceIds?: string[]) => void
  onServiceUpdate: (serviceId: string, field: keyof SelectedService, value: number) => void
  onServiceRemove: (serviceId: string) => void
  onServiceAdd: () => void
  onRetainerConfigChange: (config: any) => void
  onProposalDataChange: (field: keyof LegalProposalData, value: any) => void
  onGeneratePDF: () => void
  onSendProposal: () => void
}

export const LegalProposalStepContent: React.FC<LegalProposalStepContentProps> = ({
  currentStep,
  proposalData,
  onClientSelected,
  onAreaAndServicesChange,
  onServiceUpdate,
  onServiceRemove,
  onServiceAdd,
  onRetainerConfigChange,
  onProposalDataChange,
  onGeneratePDF,
  onSendProposal
}) => {
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-6">Selección de Cliente</h3>
            <ClientSelectorWithProspect
              selectedClientId={proposalData.clientId}
              onClientSelected={onClientSelected}
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-6">Selección y Configuración de Servicios</h3>
            
            <LegalServiceSelector
              selectedServices={proposalData.selectedServices.map(s => s.id)}
              selectedArea={proposalData.selectedArea}
              onAreaAndServicesChange={onAreaAndServicesChange}
            />

            {proposalData.selectedServices.length > 0 && (
              <LegalServiceManager
                selectedServices={proposalData.selectedServices}
                onServiceUpdate={onServiceUpdate}
                onServiceRemove={onServiceRemove}
                onServiceAdd={onServiceAdd}
              />
            )}
          </div>
        )

      case 3:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-6">Configuración de Honorarios</h3>
            <LegalRetainerConfigurator
              config={proposalData.retainerConfig}
              onConfigChange={onRetainerConfigChange}
              estimatedMonthlyHours={10}
            />
          </div>
        )

      case 4:
        return (
          <div>
            <LegalProposalTexts
              introduction={proposalData.introduction}
              onIntroductionChange={(value) => onProposalDataChange('introduction', value)}
              terms={proposalData.terms}
              onTermsChange={(value) => onProposalDataChange('terms', value)}
              practiceArea={proposalData.selectedArea}
            />
            
            <div className="mt-6">
              <Label htmlFor="title">Título de la Propuesta</Label>
              <Input
                id="title"
                value={proposalData.title}
                onChange={(e) => onProposalDataChange('title', e.target.value)}
                placeholder="Ej: Servicios Jurídicos Integrales - Área Fiscal"
              />
            </div>
          </div>
        )

      case 5:
        return (
          <LegalProposalPreview
            title={proposalData.title}
            clientName="Cliente seleccionado"
            practiceArea={proposalData.selectedArea}
            introduction={proposalData.introduction}
            terms={proposalData.terms}
            selectedServices={proposalData.selectedServices}
            retainerConfig={proposalData.retainerConfig}
            validityDays={proposalData.validityDays}
            onGeneratePDF={onGeneratePDF}
            onSendProposal={onSendProposal}
          />
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardContent className="p-8">
        {renderStepContent()}
      </CardContent>
    </Card>
  )
}
