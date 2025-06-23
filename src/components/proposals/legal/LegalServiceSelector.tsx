
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
    if (areaId !== selectedArea) {
      // Limpiar servicios al cambiar de área
      onAreaAndServicesChange(areaId, [])
    }
  }

  const handleServiceToggle = (serviceId: string) => {
    console.log('Service toggled:', serviceId)
    
    if (!selectedServices || !Array.isArray(selectedServices)) {
      console.warn('Invalid selectedServices:', selectedServices)
      onAreaAndServicesChange(selectedArea, [serviceId])
      return
    }
    
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

  const selectedAreaData = selectedArea ? practiceAreasData[selectedArea] : null

  if (!selectedArea) {
    return (
      <div className="space-y-6">
        <PracticeAreaSelector
          selectedArea=""
          onAreaSelect={handleAreaSelect}
        />
        <div className="text-center py-8 text-gray-500">
          <p>Selecciona un área de práctica para ver los servicios disponibles</p>
        </div>
      </div>
    )
  }

  if (!selectedAreaData) {
    console.error('Area data not found for:', selectedArea)
    return (
      <div className="space-y-6">
        <PracticeAreaSelector
          selectedArea={selectedArea}
          onAreaSelect={handleAreaSelect}
        />
        <div className="text-center py-8 text-red-500">
          <p>Error: No se pudieron cargar los datos del área seleccionada</p>
          <p className="text-sm">Área: {selectedArea}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PracticeAreaSelector
        selectedArea={selectedArea}
        onAreaSelect={handleAreaSelect}
      />

      <ServicesList
        selectedAreaData={selectedAreaData}
        selectedServices={selectedServices}
        onServiceToggle={handleServiceToggle}
      />
    </div>
  )
}
