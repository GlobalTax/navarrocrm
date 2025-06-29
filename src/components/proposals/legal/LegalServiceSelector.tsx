import React from 'react'
import { PracticeAreaSelector } from './components/PracticeAreaSelector'
import { ServicesList } from './components/ServicesList'
import { practiceAreasData } from './data/practiceAreasData'
import { useServiceCatalog } from '@/hooks/useServiceCatalog'

interface LegalServiceSelectorProps {
  selectedServices: string[]
  selectedArea: string
  onAreaAndServicesChange: (areaId: string, serviceIds?: string[]) => void
  onServiceToggle?: (serviceId: string, serviceData: any) => void
}

export const LegalServiceSelector: React.FC<LegalServiceSelectorProps> = ({
  selectedServices = [],
  selectedArea,
  onAreaAndServicesChange,
  onServiceToggle
}) => {
  const { services, isLoading } = useServiceCatalog()

  console.log('LegalServiceSelector render:', { 
    selectedServices, 
    selectedArea, 
    servicesFromDb: services.length,
    isLoading
  })

  const handleAreaSelect = (areaId: string) => {
    console.log('LegalServiceSelector - Area selected:', areaId)
    if (areaId !== selectedArea) {
      // Solo cambiar área, no resetear servicios aquí
      onAreaAndServicesChange(areaId)
    }
  }

  const handleServiceToggle = (serviceId: string, serviceData: any) => {
    console.log('LegalServiceSelector - Service toggled:', serviceId, serviceData)
    
    if (onServiceToggle) {
      // Usar el handler específico para toggle
      onServiceToggle(serviceId, serviceData)
    } else {
      // Fallback al handler original (pero no debería usarse)
      console.warn('No onServiceToggle handler provided')
    }
  }

  const selectedAreaData = selectedArea ? practiceAreasData[selectedArea] : null

  if (!selectedArea) {
    return (
      <div className="space-y-6">
        <PracticeAreaSelector
          selectedArea=""
          onAreaSelect={handleAreaSelect}
        />
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un Área de Práctica</h3>
            <p className="text-gray-600">
              Elige el área de práctica que mejor se adapte a los servicios que quieres incluir en tu propuesta.
            </p>
          </div>
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
        <div className="text-center py-8 text-red-50 bg-red-50 rounded-lg border border-red-200">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-red-900 mb-2">Error: Área no encontrada</h3>
            <p className="text-red-700 mb-4">
              No se pudieron cargar los datos del área seleccionada: <strong>{selectedArea}</strong>
            </p>
            <button 
              onClick={() => handleAreaSelect('')}
              className="text-red-600 hover:text-red-800 underline text-sm"
            >
              Volver a seleccionar área
            </button>
          </div>
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
        dbServices={services}
        isLoading={isLoading}
      />
      
      {/* Información adicional del área seleccionada */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <selectedAreaData.icon className="w-5 h-5 mt-0.5" style={{ color: selectedAreaData.color }} />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              Área seleccionada: {selectedAreaData.name}
            </h4>
            <p className="text-sm text-blue-700 mb-2">
              {selectedAreaData.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-blue-600">
              <span>
                📋 {selectedServices.length} servicios seleccionados
              </span>
              {services.length > 0 && (
                <span>
                  🏪 {services.filter(s => 
                    s.practice_area?.name.toLowerCase().includes(selectedAreaData.name.toLowerCase().split(' ')[0])
                  ).length} servicios disponibles en catálogo
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
