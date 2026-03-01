
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Clock, Euro, Plus, Check, Loader2 } from 'lucide-react'
import { PracticeAreaData } from '../data/practiceAreasData'
import { CustomServiceDialog } from './CustomServiceDialog'

interface ServicesListProps {
  selectedAreaData: PracticeAreaData
  selectedServices: string[]
  onServiceToggle: (serviceId: string, serviceData: any) => void
  dbServices?: any[]
  isLoading?: boolean
}

export const ServicesList: React.FC<ServicesListProps> = ({
  selectedAreaData,
  selectedServices,
  onServiceToggle,
  dbServices = [],
  isLoading = false
}) => {
  const availableServices = React.useMemo(() => {
    const areaDbServices = dbServices.filter(service => 
      service.practice_area?.name.toLowerCase().includes(selectedAreaData.name.toLowerCase().split(' ')[0]) ||
      selectedAreaData.name.toLowerCase().includes(service.practice_area?.name.toLowerCase().split(' ')[0] || '')
    )

    if (areaDbServices.length > 0) {
      return areaDbServices.map(dbService => ({
        id: dbService.id,
        name: dbService.name,
        description: dbService.description || '',
        basePrice: dbService.default_price || 0,
        billingUnit: dbService.billing_unit,
        estimatedHours: Math.ceil((dbService.default_price || 0) / 50),
        category: 'database',
        isFromDb: true
      }))
    }

    return selectedAreaData.services.map(service => ({
      ...service,
      isFromDb: false
    }))
  }, [dbServices, selectedAreaData])

  const formatPrice = (price: number, unit: string) => {
    return `${price.toLocaleString('es-ES')}€/${unit}`
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      recurring: '#10b981',
      annual: '#f59e0b',
      periodic: '#3b82f6',
      consulting: '#8b5cf6',
      hourly: '#ef4444',
      per_case: '#6366f1',
      database: '#10b981'
    }
    return colors[category] || '#6b7280'
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      recurring: 'Recurrente',
      annual: 'Anual',
      periodic: 'Periódico',
      consulting: 'Consultoría',
      hourly: 'Por Horas',
      per_case: 'Por Caso',
      database: 'Personalizado'
    }
    return labels[category] || 'Servicio'
  }

  const handleServiceClick = (service: any) => {
    onServiceToggle(service.id, service)
  }

  const handleCheckboxChange = (service: any, checked: boolean | string) => {
    const isSelected = selectedServices.includes(service.id)
    const shouldBeSelected = checked === true

    // Evitar doble toggle cuando checkbox y card disparan eventos en cascada
    if (shouldBeSelected && !isSelected) {
      onServiceToggle(service.id, service)
    }

    if (!shouldBeSelected && isSelected) {
      onServiceToggle(service.id, service)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando servicios...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <selectedAreaData.icon className="w-5 h-5" style={{ color: selectedAreaData.color }} />
          Servicios de {selectedAreaData.name}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {selectedAreaData.description}
        </p>
      </CardHeader>
      <CardContent>
        {availableServices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <selectedAreaData.icon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No hay servicios disponibles</p>
            <p className="text-sm">Esta área de práctica no tiene servicios configurados aún.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableServices.map((service) => {
              const isSelected = selectedServices.includes(service.id)

              return (
                <div
                  key={service.id}
                  className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-sm ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-gray-300'
                  }`}
                  onClick={(e) => {
                    const target = e.target as HTMLElement
                    if (target.closest('[data-service-checkbox="true"]')) return
                    handleServiceClick(service)
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div data-service-checkbox="true" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleCheckboxChange(service, checked)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm leading-tight">
                          {service.name}
                        </h4>
                        {isSelected && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Check className="w-4 h-4" />
                            <span className="text-xs font-medium">Seleccionado</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                        {service.description}
                      </p>
                      
                      <div className="flex items-center flex-wrap gap-2">
                        <Badge 
                          variant="outline"
                          className="text-xs"
                          style={{ 
                            color: getCategoryColor(service.category),
                            borderColor: `${getCategoryColor(service.category)}50`
                          }}
                        >
                          {getCategoryLabel(service.category)}
                        </Badge>
                        
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          <Euro className="w-3 h-3" />
                          {formatPrice(service.basePrice, service.billingUnit)}
                        </Badge>
                        
                        {service.estimatedHours && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            ~{service.estimatedHours}h
                          </Badge>
                        )}

                        {service.isFromDb && (
                          <Badge variant="default" className="text-xs bg-green-500">
                            Catálogo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            <div className="text-center pt-4 border-t">
              <p className="text-xs text-gray-500 mb-2">
                ¿No encuentras el servicio que necesitas?
              </p>
              <CustomServiceDialog onServiceAdd={onServiceToggle} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
