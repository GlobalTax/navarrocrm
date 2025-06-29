
import { useState, useCallback } from 'react'
import { SelectedService } from '../types/legalProposal.types'
import { updateServiceTotal, convertServiceToSelected } from '../utils/serviceConversion'
import { practiceAreasData } from '../data/practiceAreasData'

interface UseServiceManagementProps {
  initialServices?: SelectedService[]
  onServicesChange?: (services: SelectedService[]) => void
  selectedArea?: string
  updateProposalData?: (field: string, value: any) => void
}

export const useServiceManagement = ({
  initialServices = [],
  onServicesChange,
  selectedArea,
  updateProposalData
}: UseServiceManagementProps) => {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(initialServices)

  const updateServices = useCallback((newServices: SelectedService[]) => {
    console.log('useServiceManagement - Updating services:', newServices)
    setSelectedServices(newServices)
    onServicesChange?.(newServices)
  }, [onServicesChange])

  const handleAreaChange = useCallback((areaId: string) => {
    console.log('useServiceManagement - Area changed to:', areaId)
    updateProposalData?.('selectedArea', areaId)
    // Limpiar servicios al cambiar de área
    updateServices([])
  }, [updateProposalData, updateServices])

  const handleServiceToggle = useCallback((serviceId: string, serviceData: any) => {
    console.log('useServiceManagement - Service toggle:', serviceId, serviceData)
    
    const isCurrentlySelected = selectedServices.some(s => s.id === serviceId)
    
    if (isCurrentlySelected) {
      // Remover servicio
      const updatedServices = selectedServices.filter(s => s.id !== serviceId)
      updateServices(updatedServices)
    } else {
      // Agregar servicio
      const selectedService = convertServiceToSelected(serviceData)
      const updatedServices = [...selectedServices, selectedService]
      updateServices(updatedServices)
    }
  }, [selectedServices, updateServices])

  const handleServiceUpdate = useCallback((serviceId: string, field: keyof SelectedService, value: any) => {
    const updatedServices = selectedServices.map(service => {
      if (service.id === serviceId) {
        const updated = { ...service, [field]: value }
        return updateServiceTotal(updated)
      }
      return service
    })
    updateServices(updatedServices)
  }, [selectedServices, updateServices])

  const handleServiceRemove = useCallback((serviceId: string) => {
    const updatedServices = selectedServices.filter(s => s.id !== serviceId)
    updateServices(updatedServices)
  }, [selectedServices, updateServices])

  const handleServiceAdd = useCallback(() => {
    console.log('Add service functionality - to be implemented')
  }, [])

  const getTotalAmount = useCallback(() => {
    return selectedServices.reduce((sum, service) => sum + (service.total || 0), 0)
  }, [selectedServices])

  return {
    selectedServices,
    getTotalAmount,
    hasServices: selectedServices.length > 0,
    handleAreaChange,
    handleServiceToggle,
    handleServiceUpdate,
    handleServiceRemove,
    handleServiceAdd
  }
}
