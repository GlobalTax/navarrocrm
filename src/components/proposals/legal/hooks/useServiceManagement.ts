
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
    setSelectedServices(newServices)
    onServicesChange?.(newServices)
  }, [onServicesChange])

  const addService = useCallback((service: SelectedService) => {
    const updatedServices = [...selectedServices, updateServiceTotal(service)]
    updateServices(updatedServices)
  }, [selectedServices, updateServices])

  const removeService = useCallback((serviceId: string) => {
    const updatedServices = selectedServices.filter(s => s.id !== serviceId)
    updateServices(updatedServices)
  }, [selectedServices, updateServices])

  const updateService = useCallback((serviceId: string, field: keyof SelectedService, value: any) => {
    const updatedServices = selectedServices.map(service => {
      if (service.id === serviceId) {
        const updated = { ...service, [field]: value }
        return updateServiceTotal(updated)
      }
      return service
    })
    updateServices(updatedServices)
  }, [selectedServices, updateServices])

  const getTotalAmount = useCallback(() => {
    return selectedServices.reduce((sum, service) => sum + (service.total || 0), 0)
  }, [selectedServices])

  const clearServices = useCallback(() => {
    updateServices([])
  }, [updateServices])

  // Handler for area and services change
  const handleAreaAndServicesChange = useCallback((areaId: string, serviceIds?: string[]) => {
    updateProposalData?.('selectedArea', areaId)
    
    if (serviceIds) {
      const areaData = practiceAreasData[areaId]
      if (areaData) {
        const newSelectedServices = serviceIds.map(serviceId => {
          const service = areaData.services.find(s => s.id === serviceId)
          return service ? convertServiceToSelected(service) : null
        }).filter(Boolean) as SelectedService[]
        
        updateServices(newSelectedServices)
        updateProposalData?.('selectedServices', newSelectedServices)
      }
    }
  }, [updateProposalData, updateServices])

  // Handler for service updates
  const handleServiceUpdate = useCallback((serviceId: string, field: keyof SelectedService, value: any) => {
    updateService(serviceId, field, value)
  }, [updateService])

  // Handler for service removal
  const handleServiceRemove = useCallback((serviceId: string) => {
    removeService(serviceId)
  }, [removeService])

  // Handler for service addition
  const handleServiceAdd = useCallback(() => {
    // This would typically open a service selection dialog
    console.log('Add service functionality')
  }, [])

  return {
    selectedServices,
    addService,
    removeService,
    updateService,
    getTotalAmount,
    clearServices,
    hasServices: selectedServices.length > 0,
    handleAreaAndServicesChange,
    handleServiceUpdate,
    handleServiceRemove,
    handleServiceAdd
  }
}
