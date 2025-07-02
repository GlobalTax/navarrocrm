import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Scale, 
  Heart, 
  Home, 
  Car, 
  Building, 
  Users, 
  FileText, 
  Shield,
  Briefcase,
  DollarSign
} from 'lucide-react'

interface ServicesStepProps {
  stepData: any
  clientData: any
  onUpdate: (data: any) => void
}

const legalServices = [
  {
    id: 'civil',
    name: 'Derecho Civil',
    description: 'Contratos, responsabilidad civil, propiedad',
    icon: Scale,
    color: 'bg-blue-100 text-blue-600',
    popular: false
  },
  {
    id: 'family',
    name: 'Derecho de Familia',
    description: 'Divorcios, custodias, adopciones',
    icon: Heart,
    color: 'bg-pink-100 text-pink-600',
    popular: true
  },
  {
    id: 'real_estate',
    name: 'Derecho Inmobiliario',
    description: 'Compraventa, alquileres, hipotecas',
    icon: Home,
    color: 'bg-green-100 text-green-600',
    popular: true
  },
  {
    id: 'traffic',
    name: 'Accidentes de Tráfico',
    description: 'Indemnizaciones, seguros, lesiones',
    icon: Car,
    color: 'bg-red-100 text-red-600',
    popular: false
  },
  {
    id: 'inheritance',
    name: 'Herencias y Sucesiones',
    description: 'Testamentos, legítimas, donaciones',
    icon: FileText,
    color: 'bg-purple-100 text-purple-600',
    popular: true
  },
  {
    id: 'commercial',
    name: 'Derecho Mercantil',
    description: 'Sociedades, contratos comerciales',
    icon: Building,
    color: 'bg-indigo-100 text-indigo-600',
    popular: false
  },
  {
    id: 'labor',
    name: 'Derecho Laboral',
    description: 'Despidos, nóminas, convenios',
    icon: Users,
    color: 'bg-orange-100 text-orange-600',
    popular: true
  },
  {
    id: 'criminal',
    name: 'Derecho Penal',
    description: 'Defensa penal, delitos, faltas',
    icon: Shield,
    color: 'bg-gray-100 text-gray-600',
    popular: false
  },
  {
    id: 'administrative',
    name: 'Derecho Administrativo',
    description: 'Licencias, sanciones, expedientes',
    icon: Briefcase,
    color: 'bg-yellow-100 text-yellow-600',
    popular: false
  },
  {
    id: 'tax',
    name: 'Derecho Tributario',
    description: 'Impuestos, Hacienda, inspecciones',
    icon: DollarSign,
    color: 'bg-emerald-100 text-emerald-600',
    popular: false
  }
]

export function ServicesStep({ stepData, onUpdate }: ServicesStepProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(
    stepData?.selectedServices || []
  )

  const handleServiceToggle = (serviceId: string) => {
    const newSelection = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId]
    
    setSelectedServices(newSelection)
    onUpdate({
      selectedServices: newSelection,
      timestamp: new Date().toISOString()
    })
  }

  const popularServices = legalServices.filter(service => service.popular)
  const otherServices = legalServices.filter(service => !service.popular)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">
          Áreas de Interés
        </h3>
        <p className="text-gray-600">
          Seleccione las áreas legales en las que necesita asesoramiento
        </p>
      </div>

      {/* Servicios más populares */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900">Servicios más solicitados</h4>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Populares
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularServices.map((service) => {
            const Icon = service.icon
            const isSelected = selectedServices.includes(service.id)
            
            return (
              <Card
                key={service.id}
                className={`border-0.5 rounded-[10px] cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleServiceToggle(service.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${service.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Checkbox 
                      checked={isSelected}
                      onChange={() => {}} // Controlado por el onClick del Card
                    />
                  </div>
                  <CardTitle className="text-sm font-medium">
                    {service.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-600">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Otros servicios */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Otros servicios</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherServices.map((service) => {
            const Icon = service.icon
            const isSelected = selectedServices.includes(service.id)
            
            return (
              <Card
                key={service.id}
                className={`border-0.5 rounded-[10px] cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleServiceToggle(service.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${service.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Checkbox 
                      checked={isSelected}
                      onChange={() => {}} // Controlado por el onClick del Card
                    />
                  </div>
                  <CardTitle className="text-sm font-medium">
                    {service.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-600">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Resumen de selección */}
      {selectedServices.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-[10px] p-4">
          <h5 className="font-medium text-green-900 mb-2">
            Servicios seleccionados ({selectedServices.length})
          </h5>
          <div className="flex flex-wrap gap-2">
            {selectedServices.map(serviceId => {
              const service = legalServices.find(s => s.id === serviceId)
              return service ? (
                <Badge key={serviceId} variant="secondary" className="bg-green-100 text-green-800">
                  {service.name}
                </Badge>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}