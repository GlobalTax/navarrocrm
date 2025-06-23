
import { SelectedService } from '../types/legalProposal.types'
import { practiceAreasData } from '../data/practiceAreasData'

export const convertServiceIdsToSelectedServices = (serviceIds: string[], areaId: string): SelectedService[] => {
  console.log('Converting services:', { serviceIds, areaId })
  
  // Validaciones iniciales
  if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
    console.warn('No service IDs provided or invalid format')
    return []
  }

  if (!areaId || typeof areaId !== 'string') {
    console.error('Invalid area ID:', areaId)
    return []
  }

  const areaData = practiceAreasData[areaId]
  if (!areaData) {
    console.error('Area not found:', areaId)
    return []
  }

  if (!areaData.services || !Array.isArray(areaData.services)) {
    console.error('Invalid services data for area:', areaId)
    return []
  }

  const convertedServices = serviceIds
    .map(serviceId => {
      if (!serviceId || typeof serviceId !== 'string') {
        console.warn('Invalid service ID:', serviceId)
        return null
      }

      const serviceData = areaData.services.find(s => s && s.id === serviceId)
      if (!serviceData) {
        console.error('Service not found:', { serviceId, areaId, availableServices: areaData.services.map(s => s.id) })
        return null
      }

      // Validar datos del servicio
      const basePrice = typeof serviceData.basePrice === 'number' ? serviceData.basePrice : 0
      const quantity = 1

      const selectedService: SelectedService = {
        id: serviceData.id,
        name: serviceData.name || 'Servicio sin nombre',
        description: serviceData.description || 'Sin descripción',
        basePrice: basePrice,
        customPrice: basePrice,
        quantity: quantity,
        billingUnit: serviceData.billingUnit || 'unidad',
        estimatedHours: typeof serviceData.estimatedHours === 'number' ? serviceData.estimatedHours : undefined,
        total: basePrice * quantity
      }

      console.log('Converted service:', selectedService)
      return selectedService
    })
    .filter((service): service is SelectedService => service !== null)

  console.log('All converted services:', convertedServices)
  return convertedServices
}

export const validateSelectedService = (service: any): service is SelectedService => {
  return (
    service &&
    typeof service === 'object' &&
    typeof service.id === 'string' &&
    typeof service.name === 'string' &&
    typeof service.basePrice === 'number' &&
    typeof service.customPrice === 'number' &&
    typeof service.quantity === 'number' &&
    typeof service.total === 'number'
  )
}

export const recalculateServiceTotal = (service: SelectedService): SelectedService => {
  const quantity = service.quantity || 1
  const customPrice = service.customPrice || service.basePrice || 0
  
  return {
    ...service,
    quantity,
    customPrice,
    total: quantity * customPrice
  }
}
