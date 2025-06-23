
import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { LegalService } from '../data/practiceAreasData'

interface ServiceItemProps {
  service: LegalService
  isSelected: boolean
  onToggle: (serviceId: string) => void
}

export const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  isSelected,
  onToggle
}) => {
  return (
    <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(service.id)}
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
  )
}
