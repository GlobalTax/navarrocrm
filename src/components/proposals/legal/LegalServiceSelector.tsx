
import React from 'react'
import { PracticeAreaSelector } from './components/PracticeAreaSelector'
import { ServicesList } from './components/ServicesList'
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

  const selectedAreaData = practiceAreasData[selectedArea]

  return (
    <div className="space-y-6">
      <PracticeAreaSelector
        selectedArea={selectedArea}
        onAreaSelect={handleAreaSelect}
      />

      {selectedAreaData && (
        <ServicesList
          selectedAreaData={selectedAreaData}
          selectedServices={selectedServices}
          onServiceToggle={handleServiceToggle}
        />
      )}
    </div>
  )
}
