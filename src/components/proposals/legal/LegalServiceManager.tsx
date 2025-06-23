
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, Calculator } from 'lucide-react'

interface SelectedService {
  id: string
  name: string
  description: string
  basePrice: number
  customPrice: number
  quantity: number
  billingUnit: string
  estimatedHours?: number
  total: number
}

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
    return selectedServices.reduce((sum, service) => sum + service.total, 0)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Gestión de Servicios Seleccionados
          </CardTitle>
          <Button onClick={onServiceAdd} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Añadir Servicio
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedServices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay servicios seleccionados</p>
            <p className="text-sm">Selecciona servicios en el paso anterior</p>
          </div>
        ) : (
          <>
            {selectedServices.map((service) => (
              <div key={service.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{service.name}</h4>
                      {service.estimatedHours && (
                        <Badge variant="secondary">
                          {service.estimatedHours}h estimadas
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onServiceRemove(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor={`quantity-${service.id}`} className="text-sm">
                      Cantidad
                    </Label>
                    <Input
                      id={`quantity-${service.id}`}
                      type="number"
                      min="1"
                      value={service.quantity}
                      onChange={(e) => onServiceUpdate(service.id, 'quantity', Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`price-${service.id}`} className="text-sm">
                      Precio Unitario (€)
                    </Label>
                    <Input
                      id={`price-${service.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={service.customPrice}
                      onChange={(e) => onServiceUpdate(service.id, 'customPrice', Number(e.target.value))}
                    />
                    {service.customPrice !== service.basePrice && (
                      <p className="text-xs text-gray-500 mt-1">
                        Precio base: {service.basePrice}€
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm">Unidad de Facturación</Label>
                    <div className="p-2 bg-gray-50 rounded border text-sm">
                      {service.billingUnit}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">Total</Label>
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded font-semibold text-blue-900">
                      {service.total.toLocaleString('es-ES', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total de la Propuesta:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {getTotalAmount().toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  })}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
