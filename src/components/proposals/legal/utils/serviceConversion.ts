
import { SelectedService } from '../types/legalProposal.types'
import { practiceAreasData } from '../data/practiceAreasData'

export const convertServiceIdsToSelectedServices = (serviceIds: string[], areaId: string): SelectedService[] => {
  console.log('Converting services:', { serviceIds, areaId })
  
  const areaData = practiceAreasData[areaId]
  if (!areaData) {
    console.error('Area not found:', areaId)
    return []
  }

  const convertedServices = serviceIds.map(serviceId => {
    const serviceData = areaData.services.find(s => s.id === serviceId)
    if (!serviceData) {
      console.error('Service not found:', serviceId)
      return null
    }

    const selectedService: SelectedService = {
      id: serviceData.id,
      name: serviceData.name,
      description: serviceData.description,
      basePrice: serviceData.basePrice,
      customPrice: serviceData.basePrice,
      quantity: 1,
      billingUnit: serviceData.billingUnit,
      estimatedHours: serviceData.estimatedHours,
      total: serviceData.basePrice * 1
    }

    console.log('Converted service:', selectedService)
    return selectedService
  }).filter(Boolean) as SelectedService[]

  console.log('All converted services:', convertedServices)
  return convertedServices
}
