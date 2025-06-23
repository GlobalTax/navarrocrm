
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { practiceAreasData } from './data/practiceAreasData'

interface LegalServiceSelectorProps {
  selectedServices: string[]
  selectedArea: string
  onAreaAndServicesChange: (areaId: string, serviceIds?: string[]) => void
}

export const LegalServiceSelector: React.FC<LegalServiceSelectorProps> = ({
  selectedServices = [],
  selectedArea,
  onAreaAndServicesChange
}) => {
  console.log('LegalServiceSelector render:', { selectedServices, selectedArea })

  const handleAreaSelect = (areaId: string) => {
    console.log('Area selected:', areaId)
    // Limpiar servicios al cambiar de área
    onAreaAndServicesChange(areaId, [])
  }

  const handleServiceToggle = (serviceId: string) => {
    console.log('Service toggled:', serviceId)
    const isCurrentlySelected = selectedServices.includes(serviceId)
    
    let newServices: string[]
    if (isCurrentlySelected) {
      newServices = selectedServices.filter(id => id !== serviceId)
    } else {
      newServices = [...selectedServices, serviceId]
    }
    
    console.log('New services for area:', selectedArea, newServices)
    onAreaAndServicesChange(selectedArea, newServices)
  }

  const practiceAreasArray = Object.values(practiceAreasData)
  const selectedAreaData = practiceAreasData[selectedArea]

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold text-gray-900">Área de Práctica</Label>
        <p className="text-sm text-gray-600 mb-4">
          Selecciona el área jurídica principal para esta propuesta
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {practiceAreasArray.map((area) => {
            const Icon = area.icon
            return (
              <Card
                key={area.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedArea === area.id 
                    ? area.color + ' shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleAreaSelect(area.id)}
              >
                <CardContent className="p-4 text-center">
                  <Icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  <h3 className="font-medium text-sm">{area.name}</h3>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {selectedAreaData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <selectedAreaData.icon className="h-5 w-5" />
              Servicios Disponibles - {selectedAreaData.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedAreaData.services.map((service) => (
              <div key={service.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  checked={selectedServices.includes(service.id)}
                  onCheckedChange={() => handleServiceToggle(service.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {service.basePrice}€/{service.billingUnit}
                      </Badge>
                      {service.estimatedHours && (
                        <Badge variant="secondary">
                          {service.estimatedHours}h estimadas
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
