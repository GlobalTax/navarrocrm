
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
  updateProposalData: (field: keyof LegalProposalData, value: any) => void
  selectedServiceIds: string[]
  onAreaChange: (areaId: string) => void
  onServiceToggle: (serviceId: string, serviceData: any) => void
  onServiceUpdate: (serviceId: string, field: keyof SelectedService, value: any) => void
  onServiceRemove: (serviceId: string) => void
  onServiceAdd: () => void
  practiceAreasData: Record<string, any>
}

export const LegalProposalStepContent: React.FC<LegalProposalStepContentProps> = ({
  currentStep,
  proposalData,
  updateProposalData,
  selectedServiceIds,
  onAreaChange,
  onServiceToggle,
  onServiceUpdate,
  onServiceRemove,
  onServiceAdd,
  practiceAreasData
}) => {
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-6">Selección de Cliente</h3>
            <ClientSelectorWithProspect
              selectedClientId={proposalData.clientId}
              onClientSelected={(clientId) => {
                updateProposalData('clientId', clientId)
              }}
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-6">Selección y Configuración de Servicios</h3>
            
            <LegalServiceSelector
              selectedServices={selectedServiceIds}
              selectedArea={proposalData.selectedArea}
              onAreaChange={onAreaChange}
              onServiceToggle={onServiceToggle}
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
              onConfigChange={(config) => {
                updateProposalData('retainerConfig', config)
              }}
              estimatedMonthlyHours={10}
            />
          </div>
        )

      case 4:
        return (
          <div>
            <LegalProposalTexts
              introduction={proposalData.introduction}
              onIntroductionChange={(value) => {
                updateProposalData('introduction', value)
              }}
              terms={proposalData.terms}
              onTermsChange={(value) => {
                updateProposalData('terms', value)
              }}
              practiceArea={proposalData.selectedArea}
            />
            
            <div className="mt-6">
              <Label htmlFor="title">Título de la Propuesta</Label>
              <Input
                id="title"
                value={proposalData.title}
                onChange={(e) => {
                  updateProposalData('title', e.target.value)
                }}
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
            onGeneratePDF={() => {
              console.log('Generate PDF')
            }}
            onSendProposal={() => {
              console.log('Send proposal')
            }}
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
