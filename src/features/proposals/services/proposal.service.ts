import { supabase } from '@/integrations/supabase/client'
import type { ProposalFormData } from '@/types/proposals/forms'
import { transformLineItemsToServices, validateProposalData } from '../utils/dataTransformer'

export const saveProposal = async (proposalData: ProposalFormData | any) => {
  console.log('💾 ProposalService - Guardando propuesta:', proposalData)

  try {
    // Validar datos antes de procesar
    const validationErrors = validateProposalData(proposalData)
    if (validationErrors.length > 0) {
      throw new Error(`Errores de validación: ${validationErrors.join(', ')}`)
    }

    // Obtener información del usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Usuario no autenticado')
    }

    // Obtener la información del usuario desde la tabla users para obtener org_id
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (userDataError || !userData) {
      throw new Error('No se pudo obtener información del usuario')
    }

    // Procesar servicios - pueden venir como selectedServices o line_items
    let services: any[] = []
    
    if (proposalData.selectedServices && Array.isArray(proposalData.selectedServices)) {
      services = proposalData.selectedServices
    } else if (proposalData.line_items && Array.isArray(proposalData.line_items)) {
      // Convertir line_items a formato selectedServices
      services = transformLineItemsToServices(proposalData.line_items)
    }
    
    console.log('🔄 Servicios procesados:', services.length, 'elementos')
    
    // Calcular el total de los servicios
    const totalAmount = services.reduce((sum, service) => {
      return sum + (service.total || service.customPrice || service.basePrice || 0)
    }, 0)

    console.log('💰 Total calculado:', totalAmount, 'de', services.length, 'servicios')

    // Preparar datos para la propuesta con solo campos que existen en la tabla
    const proposalInsert = {
      org_id: userData.org_id,
      created_by: user.id,
      contact_id: proposalData.clientId || proposalData.contact_id,
      title: proposalData.title,
      description: proposalData.introduction || proposalData.description || '',
      total_amount: totalAmount,
      status: 'draft' as const,
      is_recurring: proposalData.is_recurring || false,
      recurring_frequency: proposalData.recurring_frequency || null,
      auto_renewal: proposalData.retainerConfig?.autoRenewal || proposalData.auto_renewal || false,
      scope_of_work: proposalData.terms || proposalData.scope_of_work || '',
      valid_until: proposalData.validUntil 
        ? new Date(proposalData.validUntil).toISOString()
        : proposalData.valid_until
        ? new Date(proposalData.valid_until).toISOString()
        : new Date(Date.now() + (proposalData.validityDays || 30) * 24 * 60 * 60 * 1000).toISOString(),
      // Campos adicionales para propuestas recurrentes
      contract_start_date: proposalData.contract_start_date || null,
      contract_end_date: proposalData.contract_end_date || null,
      retainer_amount: proposalData.retainerConfig?.retainerAmount || proposalData.retainer_amount || null,
      included_hours: proposalData.retainerConfig?.includedHours || proposalData.included_hours || null,
      hourly_rate_extra: proposalData.retainerConfig?.extraHourlyRate || proposalData.hourly_rate_extra || null,
      billing_day: proposalData.retainerConfig?.billingDay || proposalData.billing_day || 1,
      notes: proposalData.notes || null
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
        name: service.name, // Usar 'name' en lugar de 'service_name'
        description: service.description || '',
        quantity: service.quantity || 1,
        unit_price: service.customPrice || service.basePrice || 0,
        total_price: service.total || service.customPrice || service.basePrice || 0,
        billing_unit: service.billingUnit || 'unit'
        // Removemos estimated_hours ya que no existe en la tabla proposal_line_items
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