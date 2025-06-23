
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ServiceItem } from './ServiceItem'
import { LegalPracticeArea } from '../data/practiceAreasData'

interface ServicesListProps {
  selectedAreaData: LegalPracticeArea
  selectedServices: string[]
  onServiceToggle: (serviceId: string) => void
}

export const ServicesList: React.FC<ServicesListProps> = ({
  selectedAreaData,
  selectedServices,
  onServiceToggle
}) => {
  const Icon = selectedAreaData.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          Servicios Disponibles - {selectedAreaData.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedAreaData.services.map((service) => (
          <ServiceItem
            key={service.id}
            service={service}
            isSelected={selectedServices.includes(service.id)}
            onToggle={onServiceToggle}
          />
        ))}
      </CardContent>
    </Card>
  )
}
