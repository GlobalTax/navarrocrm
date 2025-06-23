
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Scale, Building, Users, FileText, Gavel, Calculator } from 'lucide-react'

interface LegalPracticeArea {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  services: LegalService[]
}

interface LegalService {
  id: string
  name: string
  description: string
  basePrice: number
  billingUnit: string
  isRecurring: boolean
  estimatedHours?: number
}

const practiceAreas: LegalPracticeArea[] = [
  {
    id: 'fiscal',
    name: 'Fiscal y Tributario',
    icon: Calculator,
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    services: [
      {
        id: 'fiscal-1',
        name: 'Asesoría Fiscal Mensual',
        description: 'Gestión integral de obligaciones fiscales y tributarias',
        basePrice: 150,
        billingUnit: 'mes',
        isRecurring: true,
        estimatedHours: 8
      },
      {
        id: 'fiscal-2',
        name: 'Declaraciones Trimestrales',
        description: 'IVA, IRPF, Retenciones y otros impuestos periódicos',
        basePrice: 80,
        billingUnit: 'trimestre',
        isRecurring: true,
        estimatedHours: 4
      },
      {
        id: 'fiscal-3',
        name: 'Renta Anual',
        description: 'Declaración anual de la renta y patrimonio',
        basePrice: 200,
        billingUnit: 'año',
        isRecurring: true,
        estimatedHours: 6
      }
    ]
  },
  {
    id: 'laboral',
    name: 'Laboral y Seguridad Social',
    icon: Users,
    color: 'bg-green-50 border-green-200 text-green-800',
    services: [
      {
        id: 'laboral-1',
        name: 'Asesoría Laboral Integral',
        description: 'Gestión de nóminas, contratos y Seguridad Social',
        basePrice: 120,
        billingUnit: 'mes',
        isRecurring: true,
        estimatedHours: 10
      },
      {
        id: 'laboral-2',
        name: 'Gestión de Nóminas',
        description: 'Elaboración mensual de nóminas y seguros sociales',
        basePrice: 15,
        billingUnit: 'empleado/mes',
        isRecurring: true,
        estimatedHours: 1
      },
      {
        id: 'laboral-3',
        name: 'Representación Legal Laboral',
        description: 'Defensa en procedimientos laborales y Inspección',
        basePrice: 300,
        billingUnit: 'mes',
        isRecurring: true,
        estimatedHours: 5
      }
    ]
  },
  {
    id: 'mercantil',
    name: 'Mercantil y Societario',
    icon: Building,
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    services: [
      {
        id: 'mercantil-1',
        name: 'Asesoría Societaria',
        description: 'Gestión de sociedades, juntas y documentación social',
        basePrice: 200,
        billingUnit: 'mes',
        isRecurring: true,
        estimatedHours: 6
      },
      {
        id: 'mercantil-2',
        name: 'Compliance Corporativo',
        description: 'Cumplimiento normativo y gobierno corporativo',
        basePrice: 400,
        billingUnit: 'mes',
        isRecurring: true,
        estimatedHours: 8
      }
    ]
  },
  {
    id: 'civil',
    name: 'Civil y Patrimonial',
    icon: Scale,
    color: 'bg-orange-50 border-orange-200 text-orange-800',
    services: [
      {
        id: 'civil-1',
        name: 'Asesoría Patrimonial',
        description: 'Gestión integral del patrimonio familiar y empresarial',
        basePrice: 250,
        billingUnit: 'mes',
        isRecurring: true,
        estimatedHours: 5
      }
    ]
  }
]

interface LegalServiceSelectorProps {
  selectedServices: string[]
  onServicesChange: (services: string[]) => void
  onAreaChange: (areaId: string) => void
}

export const LegalServiceSelector: React.FC<LegalServiceSelectorProps> = ({
  selectedServices,
  onServicesChange,
  onAreaChange
}) => {
  const [selectedArea, setSelectedArea] = React.useState<string>('')

  const handleAreaSelect = (areaId: string) => {
    setSelectedArea(areaId)
    onAreaChange(areaId)
  }

  const handleServiceToggle = (serviceId: string) => {
    const newServices = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId]
    onServicesChange(newServices)
  }

  const selectedAreaData = practiceAreas.find(area => area.id === selectedArea)

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold text-gray-900">Área de Práctica</Label>
        <p className="text-sm text-gray-600 mb-4">
          Selecciona el área jurídica principal para esta propuesta
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {practiceAreas.map((area) => {
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
