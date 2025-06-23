
import { useCallback } from 'react'
import { SelectedService } from '../types/legalProposal.types'
import { convertServiceIdsToSelectedServices, validateSelectedService, recalculateServiceTotal } from '../utils/serviceConversion'

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
    
    try {
      const convertedServices = serviceIds.length > 0 
        ? convertServiceIdsToSelectedServices(serviceIds, areaId)
        : []

      // Validar servicios convertidos
      const validServices = convertedServices.filter(service => {
        const isValid = validateSelectedService(service)
        if (!isValid) {
          console.warn('Invalid service detected:', service)
        }
        return isValid
      })

      console.log('Updating proposal data with:', { areaId, validServices })
      updateProposalData('selectedArea', areaId)
      updateProposalData('selectedServices', validServices)
    } catch (error) {
      console.error('Error in handleAreaAndServicesChange:', error)
      // En caso de error, al menos actualizar el área
      updateProposalData('selectedArea', areaId)
      updateProposalData('selectedServices', [])
    }
  }, [updateProposalData])

  const handleServiceUpdate = useCallback((serviceId: string, field: keyof SelectedService, value: number) => {
    console.log('Updating service:', { serviceId, field, value })
    
    if (!selectedServices || !Array.isArray(selectedServices)) {
      console.warn('Invalid selectedServices:', selectedServices)
      return
    }

    try {
      const updatedServices = selectedServices.map(service => {
        if (!service || service.id !== serviceId) {
          return service
        }

        const updated = { ...service, [field]: value }
        
        // Recalcular total si se cambia cantidad o precio
        if (field === 'quantity' || field === 'customPrice') {
          const recalculated = recalculateServiceTotal(updated)
          console.log('Recalculated service:', recalculated)
          return recalculated
        }
        
        console.log('Updated service:', updated)
        return updated
      })

      // Validar todos los servicios actualizados
      const validServices = updatedServices.filter(validateSelectedService)
      updateProposalData('selectedServices', validServices)
    } catch (error) {
      console.error('Error updating service:', error)
    }
  }, [selectedServices, updateProposalData])

  const handleServiceRemove = useCallback((serviceId: string) => {
    console.log('Removing service:', serviceId)
    
    if (!selectedServices || !Array.isArray(selectedServices)) {
      console.warn('Invalid selectedServices for removal:', selectedServices)
      return
    }

    try {
      const filteredServices = selectedServices.filter(service => 
        service && service.id !== serviceId
      )
      updateProposalData('selectedServices', filteredServices)
    } catch (error) {
      console.error('Error removing service:', error)
    }
  }, [selectedServices, updateProposalData])

  const handleServiceAdd = useCallback(() => {
    console.log('Add new service - redirecting to step 2')
    return 2
  }, [])

  return {
    handleAreaAndServicesChange,
    handleServiceUpdate,
    handleServiceRemove,
    handleServiceAdd
  }
}
