
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
              const servicesTotal = proposalData.selectedServices.reduce((sum, s) => sum + (s.customPrice * s.quantity), 0)
              const iva = servicesTotal * 0.21
              const total = servicesTotal + iva
              const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
              const validUntil = new Date(Date.now() + proposalData.validityDays * 86400000).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
              const freq: Record<string, string> = { monthly: 'Mensual', quarterly: 'Trimestral', yearly: 'Anual' }

              const servicesRows = proposalData.selectedServices.map(s => `
                <tr>
                  <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${s.name}</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${s.quantity}</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right">${s.customPrice.toLocaleString('es-ES')} €</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right">${(s.customPrice * s.quantity).toLocaleString('es-ES')} €</td>
                </tr>
              `).join('')

              const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
                <title>${proposalData.title || 'Propuesta Legal'}</title>
                <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                  *{margin:0;padding:0;box-sizing:border-box}
                  body{font-family:'Manrope',sans-serif;color:#1a1a1a;padding:48px;max-width:800px;margin:0 auto;font-size:14px;line-height:1.6}
                  h1{font-size:24px;font-weight:700;margin-bottom:4px}
                  h2{font-size:16px;font-weight:700;margin:32px 0 12px;padding-bottom:6px;border-bottom:2px solid #0061FF}
                  table{width:100%;border-collapse:collapse;margin:12px 0}
                  th{background:#f3f4f6;padding:10px 12px;text-align:left;font-weight:600;font-size:13px;border-bottom:2px solid #d1d5db}
                  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid #0061FF}
                  .meta{color:#6b7280;font-size:13px}
                  .totals{margin-top:16px;text-align:right}
                  .totals td{padding:6px 12px}
                  .total-final{font-size:18px;font-weight:700;color:#0061FF}
                  .retainer-box{background:#f0f6ff;border:1px solid #bfd7ff;border-radius:8px;padding:20px;margin:12px 0}
                  .retainer-box dt{font-weight:600;color:#0061FF;font-size:13px}
                  .retainer-box dd{margin:0 0 12px;font-size:14px}
                  .signature{display:flex;justify-content:space-between;margin-top:48px}
                  .sig-block{width:45%;border-top:1px solid #1a1a1a;padding-top:8px;font-size:13px}
                  @media print{body{padding:24px}@page{margin:20mm}}
                </style></head><body>
                <div class="header">
                  <div><h1>${proposalData.title || 'Propuesta de Servicios Jurídicos'}</h1>
                  <p class="meta">Área: ${proposalData.selectedArea || 'General'}</p></div>
                  <div style="text-align:right"><p class="meta">Fecha: ${today}</p>
                  <p class="meta">Válida hasta: ${validUntil}</p></div>
                </div>

                <h2>1. Introducción</h2>
                <p>${proposalData.introduction || 'Sin introducción definida.'}</p>

                <h2>2. Servicios Propuestos</h2>
                <table>
                  <thead><tr><th>Servicio</th><th style="text-align:center">Cantidad</th><th style="text-align:right">Precio Unit.</th><th style="text-align:right">Total</th></tr></thead>
                  <tbody>${servicesRows}</tbody>
                </table>
                <table class="totals">
                  <tr><td>Subtotal:</td><td>${servicesTotal.toLocaleString('es-ES')} €</td></tr>
                  <tr><td>IVA (21%):</td><td>${iva.toLocaleString('es-ES')} €</td></tr>
                  <tr><td class="total-final">Total:</td><td class="total-final">${total.toLocaleString('es-ES')} €</td></tr>
                </table>

                <h2>3. Condiciones del Retainer</h2>
                <div class="retainer-box"><dl>
                  <dt>Cuota ${freq[proposalData.retainerConfig.billingFrequency] || 'Mensual'}</dt><dd>${proposalData.retainerConfig.retainerAmount.toLocaleString('es-ES')} €</dd>
                  <dt>Horas incluidas</dt><dd>${proposalData.retainerConfig.includedHours} h</dd>
                  <dt>Tarifa hora extra</dt><dd>${proposalData.retainerConfig.extraHourlyRate.toLocaleString('es-ES')} €/h</dd>
                  <dt>Duración del contrato</dt><dd>${proposalData.retainerConfig.contractDuration} meses</dd>
                  <dt>Renovación automática</dt><dd>${proposalData.retainerConfig.autoRenewal ? 'Sí' : 'No'}</dd>
                  <dt>Plazo de pago</dt><dd>${proposalData.retainerConfig.paymentTerms} días</dd>
                </dl></div>

                <h2>4. Términos y Condiciones</h2>
                <p>${proposalData.terms || 'Sin términos definidos.'}</p>

                <h2>5. Aceptación</h2>
                <p>La presente propuesta tiene una validez de <strong>${proposalData.validityDays} días</strong> desde la fecha de emisión.</p>
                <div class="signature">
                  <div class="sig-block"><p>Firma del Cliente</p><p class="meta">Fecha: _______________</p></div>
                  <div class="sig-block"><p>Firma del Asesor</p><p class="meta">Fecha: _______________</p></div>
                </div>
              </body></html>`

              const printWindow = window.open('', '_blank')
              if (printWindow) {
                printWindow.document.write(html)
                printWindow.document.close()
                printWindow.onload = () => printWindow.print()
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
