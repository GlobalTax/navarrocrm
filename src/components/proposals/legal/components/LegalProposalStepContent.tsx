
import React from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { supabase } from '@/integrations/supabase/client'
import { generateProposalPDF, openProposalPrintWindow } from '@/components/proposals/utils/generateProposalPDF'

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
  // Fetch client data when clientId is set
  const { data: clientData } = useQuery({
    queryKey: ['contact-for-proposal', proposalData.clientId],
    queryFn: async () => {
      const { data } = await supabase
        .from('contacts')
        .select('name, dni_nif, email, phone')
        .eq('id', proposalData.clientId)
        .single()
      return data
    },
    enabled: !!proposalData.clientId,
  })

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
            clientName={clientData?.name || 'Cliente seleccionado'}
            practiceArea={proposalData.selectedArea}
            introduction={proposalData.introduction}
            terms={proposalData.terms}
            selectedServices={proposalData.selectedServices}
            retainerConfig={proposalData.retainerConfig}
            validityDays={proposalData.validityDays}
            client={clientData ? { name: clientData.name, nif: clientData.dni_nif || undefined, email: clientData.email || undefined, phone: clientData.phone || undefined } : undefined}
            onGeneratePDF={async () => {
              const servicesTotal = proposalData.selectedServices.reduce((sum, s) => sum + (s.customPrice * s.quantity), 0)
              const iva = servicesTotal * 0.21
              const total = servicesTotal + iva
              const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
              const validUntilDate = new Date(Date.now() + proposalData.validityDays * 86400000).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })

              const html = generateProposalPDF({
                type: 'retainer',
                title: proposalData.title || 'Propuesta de Servicios Jurídicos',
                refNumber: `RET-${Date.now().toString(36).toUpperCase()}`,
                date: today,
                validUntil: validUntilDate,
                practiceArea: proposalData.selectedArea,
                client: clientData ? { name: clientData.name, nif: clientData.dni_nif || undefined, email: clientData.email || undefined, phone: clientData.phone || undefined } : undefined,
                introduction: proposalData.introduction,
                terms: proposalData.terms,
                validityDays: proposalData.validityDays,
                rows: proposalData.selectedServices.map(s => ({
                  name: s.name,
                  description: s.description,
                  quantity: s.quantity,
                  unitPrice: s.customPrice,
                  total: s.customPrice * s.quantity,
                })),
                totals: { subtotal: servicesTotal, tax: iva, taxRate: 21, total },
                retainerConfig: proposalData.retainerConfig,
              })
              openProposalPrintWindow(html)
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
