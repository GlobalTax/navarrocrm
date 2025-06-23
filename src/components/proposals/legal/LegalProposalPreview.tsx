
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Send, Calendar, Euro } from 'lucide-react'

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
  selectedServices,
  retainerConfig,
  validityDays,
  onGeneratePDF,
  onSendProposal
}) => {
  const getTotalAmount = () => {
    return selectedServices.reduce((sum, service) => sum + service.total, 0)
  }

  const getValidUntilDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + validityDays)
    return date.toLocaleDateString('es-ES')
  }

  return (
    <div className="space-y-6">
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

      {/* Propuesta Preview */}
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
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Introducción</h4>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {introduction}
            </div>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Servicios Incluidos</h4>
            <div className="space-y-4">
              {selectedServices.map((service) => (
                <div key={service.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{service.name}</h5>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {service.quantity} × {service.customPrice}€ / {service.billingUnit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {service.total.toLocaleString('es-ES', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuración Económica */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Resumen Económico
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-blue-600 font-medium">Cuota Base</p>
                <p className="text-lg font-semibold text-blue-900">
                  {retainerConfig.retainerAmount}€ / {retainerConfig.billingFrequency}
                </p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Horas Incluidas</p>
                <p className="text-lg font-semibold text-blue-900">
                  {retainerConfig.includedHours}h / período
                </p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Tarifa Extra</p>
                <p className="text-lg font-semibold text-blue-900">
                  {retainerConfig.extraHourlyRate}€ / hora
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-medium">Total Servicios Adicionales:</span>
                <span className="text-xl font-bold text-blue-900">
                  {getTotalAmount().toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Términos y Condiciones */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Términos y Condiciones</h4>
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg">
              {terms}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t text-sm text-gray-500">
            <p>Esta propuesta tiene una validez de {validityDays} días desde la fecha de emisión.</p>
            <p className="mt-2">Para cualquier aclaración, no dude en contactar con nosotros.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
