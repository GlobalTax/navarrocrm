
import { ServiceData } from '../data/practiceAreasData'
import { SelectedService } from '@/types/proposals'

export const convertServiceToSelected = (service: ServiceData): SelectedService => {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    price: service.basePrice,
    estimatedHours: service.estimatedHours,
    category: service.category,
    basePrice: service.basePrice,
    customPrice: service.basePrice, // Inicialmente igual al precio base
    quantity: 1,
    billingUnit: service.billingUnit,
    notes: '',
    total: service.basePrice * 1 // cantidad inicial = 1
  }
}

export const calculateServiceTotal = (service: SelectedService): number => {
  const price = service.customPrice || service.basePrice || 0
  const quantity = service.quantity || 1
  return price * quantity
}

export const updateServiceTotal = (service: SelectedService): SelectedService => {
  return {
    ...service,
    total: calculateServiceTotal(service)
  }
}

export const createServiceFromCatalog = (catalogService: any): ServiceData => {
  return {
    id: catalogService.id,
    name: catalogService.name,
    description: catalogService.description || '',
    price: catalogService.default_price || 0,
    basePrice: catalogService.default_price || 0,
    billingUnit: catalogService.billing_unit || 'hour',
    estimatedHours: Math.ceil((catalogService.default_price || 0) / 50),
    category: 'database'
  }
}

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export const formatBillingUnit = (unit: string): string => {
  const units: Record<string, string> = {
    'hour': 'hora',
    'mes': 'mes',
    'trimestre': 'trimestre',
    'año': 'año',
    'proyecto': 'proyecto',
    'consulta': 'consulta',
    'contrato': 'contrato',
    'empleado/mes': 'empleado/mes',
    'sociedad': 'sociedad',
    'modificación': 'modificación'
  }
  
  return units[unit] || unit
}
