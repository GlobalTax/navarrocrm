
import { useCallback } from 'react'
import { SelectedService } from '../types/legalProposal.types'
import { convertServiceIdsToSelectedServices } from '../utils/serviceConversion'

interface UseServiceManagementProps {
  selectedServices: SelectedService[]
  selectedArea: string
  updateProposalData: (field: string, value: any) => void
}

export const useServiceManagement = ({
  selectedServices,
  selectedArea,
  updateProposalData
}: UseServiceManagementProps) => {

  const handleAreaAndServicesChange = useCallback((areaId: string, serviceIds: string[] = []) => {
    console.log('Handling area and services change:', { areaId, serviceIds })
    
    const convertedServices = serviceIds.length > 0 
      ? convertServiceIdsToSelectedServices(serviceIds, areaId)
      : []

    updateProposalData('selectedArea', areaId)
    updateProposalData('selectedServices', convertedServices)
  }, [updateProposalData])

  const handleServiceUpdate = useCallback((serviceId: string, field: keyof SelectedService, value: number) => {
    console.log('Updating service:', { serviceId, field, value })
    
    const updatedServices = selectedServices.map(service => {
      if (service.id === serviceId) {
        const updated = { ...service, [field]: value }
        // Recalcular total si se cambia cantidad o precio
        if (field === 'quantity' || field === 'customPrice') {
          updated.total = updated.quantity * updated.customPrice
        }
        console.log('Updated service:', updated)
        return updated
      }
      return service
    })

    updateProposalData('selectedServices', updatedServices)
  }, [selectedServices, updateProposalData])

  const handleServiceRemove = useCallback((serviceId: string) => {
    console.log('Removing service:', serviceId)
    const filteredServices = selectedServices.filter(service => service.id !== serviceId)
    updateProposalData('selectedServices', filteredServices)
  }, [selectedServices, updateProposalData])

  const handleServiceAdd = useCallback(() => {
    console.log('Add new service - redirecting to step 2')
    // This will be handled by the parent component
    return 2 // Return the step to navigate to
  }, [])

  return {
    handleAreaAndServicesChange,
    handleServiceUpdate,
    handleServiceRemove,
    handleServiceAdd
  }
}
