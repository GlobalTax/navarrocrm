import type { ProposalLineItem } from '@/types/proposals'
import type { SelectedService } from '../types/proposal.schema'

/**
 * Transforma line_items del formulario a selectedServices para el servicio
 */
export const transformLineItemsToServices = (lineItems: Omit<ProposalLineItem, 'id' | 'proposal_id'>[]): SelectedService[] => {
  return lineItems.map(item => ({
    id: item.service_catalog_id || crypto.randomUUID(),
    name: item.name,
    description: item.description || '',
    basePrice: item.unit_price,
    customPrice: item.unit_price,
    quantity: item.quantity,
    billingUnit: item.billing_unit,
    total: item.total_price
  }))
}

/**
 * Transforma selectedServices a line_items para el formulario
 */
export const transformServicesToLineItems = (services: SelectedService[]): Omit<ProposalLineItem, 'id' | 'proposal_id'>[] => {
  return services.map((service, index) => ({
    service_catalog_id: service.id,
    name: service.name,
    description: service.description || '',
    quantity: service.quantity || 1,
    unit_price: service.customPrice || service.basePrice,
    total_price: service.total || (service.customPrice || service.basePrice) * (service.quantity || 1),
    billing_unit: service.billingUnit || 'unit',
    sort_order: index
  }))
}

/**
 * Valida que los datos de la propuesta son correctos antes de guardar
 */
export const validateProposalData = (data: any): string[] => {
  const errors: string[] = []
  
  if (!data.clientId && !data.contact_id) {
    errors.push('Cliente es requerido')
  }
  
  if (!data.title) {
    errors.push('Título es requerido')
  }
  
  // Verificar que hay servicios/line_items
  const hasServices = (data.selectedServices && data.selectedServices.length > 0) || 
                     (data.line_items && data.line_items.length > 0)
  
  if (!hasServices) {
    errors.push('Debe agregar al menos un servicio o elemento')
  }
  
  return errors
}