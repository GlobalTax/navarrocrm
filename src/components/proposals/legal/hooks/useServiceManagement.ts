
import { useState, useCallback } from 'react'
import { SelectedService } from '../types/legalProposal.types'
import { updateServiceTotal } from '../utils/serviceConversion'

interface UseServiceManagementProps {
  initialServices?: SelectedService[]
  onServicesChange?: (services: SelectedService[]) => void
}

export const useServiceManagement = ({
  initialServices = [],
  onServicesChange
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

  return {
    selectedServices,
    addService,
    removeService,
    updateService,
    getTotalAmount,
    clearServices,
    hasServices: selectedServices.length > 0
  }
}
