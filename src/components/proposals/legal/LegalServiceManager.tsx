
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, Calculator, Settings, Euro, Clock, AlertCircle } from 'lucide-react'
import { SelectedService } from '@/types/proposals'
import { formatCurrency, formatBillingUnit } from './utils/serviceConversion'

interface LegalServiceManagerProps {
  selectedServices: SelectedService[]
  onServiceUpdate: (serviceId: string, field: keyof SelectedService, value: number) => void
  onServiceRemove: (serviceId: string) => void
  onServiceAdd: () => void
}

export const LegalServiceManager: React.FC<LegalServiceManagerProps> = ({
  selectedServices,
  onServiceUpdate,
  onServiceRemove,
  onServiceAdd
}) => {
  const getTotalAmount = () => {
    if (!selectedServices || selectedServices.length === 0) {
      return 0
    }
    return selectedServices.reduce((sum, service) => {
      if (!service || typeof service.total !== 'number') {
        return sum
      }
      return sum + service.total
    }, 0)
  }

  const getSubtotals = () => {
    const subtotal = getTotalAmount()
    const tax = subtotal * 0.21
    const total = subtotal + tax
    
    return { subtotal, tax, total }
  }

  const { subtotal, tax, total } = getSubtotals()

  if (!selectedServices || selectedServices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Configuración de Servicios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
            <Calculator className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay servicios seleccionados</h3>
            <p className="text-gray-600 mb-4">
              Selecciona servicios en el paso anterior para configurar precios y cantidades
            </p>
            <Button onClick={onServiceAdd} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Seleccionar Servicios
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Configuración de Servicios
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {selectedServices.length} servicio{selectedServices.length !== 1 ? 's' : ''}
              </Badge>
              <Button onClick={onServiceAdd} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Servicio
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedServices.map((service) => {
            if (!service || !service.id) {
              return null
            }

            const isPriceModified = service.customPrice !== service.basePrice

            return (
              <div key={service.id} className="border rounded-lg p-6 bg-white shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{service.name || 'Servicio sin nombre'}</h4>
                      {service.estimatedHours && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.estimatedHours}h est.
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {service.description || 'Sin descripción'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onServiceRemove(service.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor={`quantity-${service.id}`} className="text-sm font-medium">
                      Cantidad
                    </Label>
                    <Input
                      id={`quantity-${service.id}`}
                      type="number"
                      min="1"
                      value={service.quantity || 1}
                      onChange={(e) => onServiceUpdate(service.id, 'quantity', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`price-${service.id}`} className="text-sm font-medium">
                      Precio Unitario (€)
                    </Label>
                    <div className="relative">
                      <Input
                        id={`price-${service.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={service.customPrice || service.basePrice || 0}
                        onChange={(e) => onServiceUpdate(service.id, 'customPrice', Number(e.target.value))}
                        className={`mt-1 ${isPriceModified ? 'border-orange-300 bg-orange-50' : ''}`}
                      />
                      {isPriceModified && (
                        <Settings className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    {isPriceModified && service.basePrice && (
                      <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                        <span>Precio original: {formatCurrency(service.basePrice)}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Unidad de Facturación</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border text-sm font-medium">
                      {formatBillingUnit(service.billingUnit || 'unidad')}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Total</Label>
                    <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded font-bold text-blue-900 flex items-center gap-2">
                      <Euro className="w-4 h-4" />
                      {formatCurrency(service.total || 0)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-green-600" />
            Resumen Financiero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium">Subtotal:</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center text-lg text-gray-600">
              <span>IVA (21%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-2xl">
                <span className="font-bold">Total de la Propuesta:</span>
                <span className="font-bold text-blue-600 flex items-center gap-2">
                  <Euro className="w-6 h-6" />
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
