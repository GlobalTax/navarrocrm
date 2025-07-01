
import { supabase } from '@/integrations/supabase/client'
import type { ProposalFormData } from '../types/proposal.schema'

export const saveProposal = async (proposalData: ProposalFormData) => {
  console.log('💾 ProposalService - Guardando propuesta:', proposalData)

  try {
    // Validar que tenemos los datos mínimos necesarios
    if (!proposalData.clientId) {
      throw new Error('Cliente es requerido')
    }

    if (!proposalData.title) {
      throw new Error('Título es requerido')
    }

    // Asegurar que selectedServices existe y es un array
    const services = Array.isArray(proposalData.selectedServices) ? proposalData.selectedServices : []
    
    // Calcular el total de los servicios
    const totalAmount = services.reduce((sum, service) => {
      return sum + (service.total || service.customPrice || service.basePrice || 0)
    }, 0)

    console.log('💰 Total calculado:', totalAmount, 'de', services.length, 'servicios')

    // Preparar datos para la propuesta
    const proposalInsert = {
      contact_id: proposalData.clientId,
      title: proposalData.title,
      description: proposalData.introduction || '',
      total_amount: totalAmount,
      status: 'draft' as const,
      is_recurring: proposalData.is_recurring || false,
      recurring_frequency: proposalData.recurring_frequency || null,
      contract_duration_months: proposalData.retainerConfig?.contractDuration || null,
      payment_terms_days: proposalData.retainerConfig?.paymentTerms || 30,
      auto_renewal: proposalData.retainerConfig?.autoRenewal || false,
      billing_frequency: proposalData.retainerConfig?.billingFrequency || 'monthly',
      billing_day: proposalData.retainerConfig?.billingDay || 1,
      terms_and_conditions: proposalData.terms || '',
      practice_area: proposalData.selectedArea || null,
      valid_until: new Date(Date.now() + (proposalData.validityDays || 30) * 24 * 60 * 60 * 1000).toISOString()
    }

    console.log('📋 Datos de propuesta preparados:', proposalInsert)

    // Insertar la propuesta
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .insert(proposalInsert)
      .select()
      .single()

    if (proposalError) {
      console.error('❌ Error al insertar propuesta:', proposalError)
      throw proposalError
    }

    console.log('✅ Propuesta creada:', proposal.id)

    // Insertar líneas de servicios si existen
    if (services.length > 0) {
      const lineItems = services.map(service => ({
        proposal_id: proposal.id,
        service_name: service.name,
        description: service.description || '',
        quantity: service.quantity || 1,
        unit_price: service.customPrice || service.basePrice || 0,
        total_price: service.total || service.customPrice || service.basePrice || 0,
        billing_unit: service.billingUnit || 'unit',
        estimated_hours: service.estimatedHours || null
      }))

      console.log('📝 Insertando', lineItems.length, 'líneas de servicio')

      const { error: lineItemsError } = await supabase
        .from('proposal_line_items')
        .insert(lineItems)

      if (lineItemsError) {
        console.error('❌ Error al insertar líneas de servicio:', lineItemsError)
        throw lineItemsError
      }

      console.log('✅ Líneas de servicio insertadas')
    }

    return proposal

  } catch (error) {
    console.error('💥 Error en saveProposal:', error)
    throw error
  }
}
