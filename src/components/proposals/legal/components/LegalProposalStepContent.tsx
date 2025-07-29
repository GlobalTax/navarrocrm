
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
            onGeneratePDF={async () => {
              try {
                // Preparar datos de la propuesta para PDF
                const proposalPdfData = {
                  title: proposalData.title,
                  clientName: "Cliente seleccionado",
                  practiceArea: proposalData.selectedArea,
                  introduction: proposalData.introduction,
                  terms: proposalData.terms,
                  selectedServices: proposalData.selectedServices,
                  retainerConfig: proposalData.retainerConfig,
                  validityDays: proposalData.validityDays
                }

                const response = await fetch('/functions/v1/generate-proposal-pdf', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(proposalPdfData)
                })

                if (!response.ok) {
                  throw new Error('Error generando PDF')
                }

                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.style.display = 'none'
                a.href = url
                a.download = `propuesta-${proposalData.title || 'legal'}.pdf`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
              } catch (error) {
                console.error('Error descargando PDF:', error)
                alert('Error al generar el PDF. Por favor, intenta de nuevo.')
              }
            }}
            onSendProposal={() => {
              alert('Funcionalidad de envío en desarrollo. El PDF se puede descargar usando el botón "Generar PDF".')
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
