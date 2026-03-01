
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Send, Calendar, Euro, AlertTriangle } from 'lucide-react'

interface SelectedService {
  id: string
  name: string
  description: string
  customPrice: number
  quantity: number
  billingUnit: string
  total: number
}

interface LegalProposalPreviewProps {
  title: string
  clientName: string
  practiceArea: string
  introduction: string
  terms: string
  selectedServices: SelectedService[]
  retainerConfig: {
    retainerAmount: number
    includedHours: number
    extraHourlyRate: number
    billingFrequency: string
    contractDuration: number
  }
  validityDays: number
  onGeneratePDF: () => void
  onSendProposal: () => void
}

export const LegalProposalPreview: React.FC<LegalProposalPreviewProps> = ({
  title,
  clientName,
  practiceArea,
  introduction,
  terms,
  selectedServices = [],
  retainerConfig,
  validityDays,
  onGeneratePDF,
  onSendProposal
}) => {
  const formatCurrency = (amount: number | undefined | null) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '0,00 €'
    }
    
    return amount.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR'
    })
  }

  const getTotalAmount = () => {
    if (!selectedServices || !Array.isArray(selectedServices) || selectedServices.length === 0) {
      return 0
    }
    
    return selectedServices.reduce((sum, service) => {
      if (!service || typeof service.total !== 'number' || isNaN(service.total)) {
        console.warn('Invalid service total:', service)
        return sum
      }
      return sum + service.total
    }, 0)
  }

  const getValidUntilDate = () => {
    try {
      const date = new Date()
      const days = typeof validityDays === 'number' && validityDays > 0 ? validityDays : 30
      date.setDate(date.getDate() + days)
      return date.toLocaleDateString('es-ES')
    } catch (error) {
      console.warn('Error calculating validity date:', error)
      return 'Fecha no disponible'
    }
  }

  const safeRetainerConfig = {
    retainerAmount: (retainerConfig?.retainerAmount && typeof retainerConfig.retainerAmount === 'number') ? retainerConfig.retainerAmount : 0,
    includedHours: (retainerConfig?.includedHours && typeof retainerConfig.includedHours === 'number') ? retainerConfig.includedHours : 0,
    extraHourlyRate: (retainerConfig?.extraHourlyRate && typeof retainerConfig.extraHourlyRate === 'number') ? retainerConfig.extraHourlyRate : 0,
    billingFrequency: (retainerConfig?.billingFrequency && typeof retainerConfig.billingFrequency === 'string') ? retainerConfig.billingFrequency : 'mensual',
    contractDuration: (retainerConfig?.contractDuration && typeof retainerConfig.contractDuration === 'number') ? retainerConfig.contractDuration : 12
  }

  const hasValidData = title && clientName && practiceArea

  if (!hasValidData) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-orange-900">Datos Incompletos</h3>
          </div>
          <p className="text-orange-700 mb-4">
            Faltan datos importantes para mostrar la vista previa. Por favor, completa:
          </p>
          <ul className="list-disc list-inside text-orange-700 space-y-1">
            {!title && <li>Título de la propuesta</li>}
            {!clientName && <li>Nombre del cliente</li>}
            {!practiceArea && <li>Área de práctica</li>}
          </ul>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "'Manrope', Arial, Helvetica, sans-serif" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Vista Previa de la Propuesta
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onGeneratePDF}>
            <Download className="h-4 w-4 mr-2" />
            Generar PDF
          </Button>
          <Button onClick={onSendProposal}>
            <Send className="h-4 w-4 mr-2" />
            Enviar Propuesta
          </Button>
        </div>
      </div>

      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="text-center">
            <CardTitle className="text-2xl font-bold mb-2">
              PROPUESTA DE SERVICIOS JURÍDICOS
            </CardTitle>
            <p className="text-blue-100">Servicios Recurrentes - {practiceArea}</p>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Cliente:</h4>
              <p className="text-gray-700">{clientName}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Área de Práctica:</h4>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                {practiceArea}
              </Badge>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Válida hasta:</h4>
              <p className="text-gray-700 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {getValidUntilDate()}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Propuesta:</h4>
              <p className="text-gray-700">{title}</p>
            </div>
          </div>

          {/* Introducción */}
          {introduction && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Introducción</h4>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {introduction}
              </div>
            </div>
          )}

          {/* Servicios */}
          {selectedServices && selectedServices.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Servicios Incluidos</h4>
              <div className="space-y-4">
                {selectedServices.map((service) => {
                  if (!service || !service.id) {
                    return null
                  }

                  return (
                    <div key={service.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{service.name || 'Servicio sin nombre'}</h5>
                        <p className="text-sm text-gray-600 mt-1">{service.description || 'Sin descripción'}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {service.quantity || 1} × {formatCurrency(service.customPrice || 0)} / {service.billingUnit || 'unidad'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(service.total || 0)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Configuración de Retainer */}
          {safeRetainerConfig.retainerAmount > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Condiciones del Retainer</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Cuota {safeRetainerConfig.billingFrequency}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(safeRetainerConfig.retainerAmount)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Horas incluidas</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {safeRetainerConfig.includedHours} h/{safeRetainerConfig.billingFrequency === 'mensual' ? 'mes' : safeRetainerConfig.billingFrequency}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Tarifa hora extra</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(safeRetainerConfig.extraHourlyRate)}/h
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Duración del contrato</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {safeRetainerConfig.contractDuration} meses
                  </p>
                </div>
              </div>
            </div>
          )}


          {terms && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Términos y Condiciones</h4>
              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                {terms}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-6 border-t text-sm text-gray-500">
            <p>Esta propuesta tiene una validez de {validityDays || 30} días desde la fecha de emisión.</p>
            <p className="mt-2">Para cualquier aclaración, no dude en contactar con nosotros.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
