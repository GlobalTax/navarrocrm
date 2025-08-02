import { supabase } from '@/integrations/supabase/client'
import { proposalsLogger } from '@/utils/logging'
import type { ProposalFormData, ServiceItemFormData } from '../types/proposal.schema'

export const saveProposal = async (proposalData: ProposalFormData) => {
  proposalsLogger.info('Guardando propuesta', { proposalData })
  
  try {
    // Calculate total amount from all tiers
    const totalAmount = proposalData.pricingTiers.reduce((tierSum, tier) => {
      const tierTotal = tier.services.reduce((serviceSum, service) => {
        return serviceSum + (service.quantity * service.unitPrice)
      }, 0)
      return tierSum + tierTotal
    }, 0)

    // Prepare proposal data
    const proposalInsert = {
      org_id: proposalData.orgId,
      contact_id: proposalData.contactId,
      title: proposalData.title,
      description: proposalData.introduction,
      scope_of_work: proposalData.scopeOfWork,
      timeline: proposalData.timeline,
      total_amount: totalAmount,
      status: 'draft' as const,
      created_by: (await supabase.auth.getUser()).data.user?.id || '',
      valid_until: proposalData.validUntil || null,
      payment_terms: proposalData.paymentTerms || null,
      is_recurring: proposalData.isRecurring || false,
      recurring_frequency: proposalData.recurringFrequency || null,
      contract_start_date: proposalData.contractStartDate || null,
      contract_end_date: proposalData.contractEndDate || null,
      retainer_amount: proposalData.retainerAmount || null,
      included_hours: proposalData.includedHours || null,
      hourly_rate_extra: proposalData.hourlyRateExtra || null,
      billing_day: proposalData.billingDay || null,
      next_billing_date: proposalData.nextBillingDate || null
    }

    proposalsLogger.info('Datos de propuesta preparados', { proposalInsert })

    // Insert proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .insert(proposalInsert)
      .select()
      .single()

    if (proposalError) {
      proposalsLogger.error('Error al insertar propuesta', { error: proposalError })
      throw proposalError
    }

    proposalsLogger.info('Propuesta creada', { proposalId: proposal.id })

    // Process and insert line items for all services in all tiers
    const allLineItems: any[] = []
    
    proposalData.pricingTiers.forEach((tier, tierIndex) => {
      tier.services.forEach((service: ServiceItemFormData, serviceIndex: number) => {
        allLineItems.push({
          proposal_id: proposal.id,
          org_id: proposalData.orgId,
          name: service.name,
          description: service.description || '',
          quantity: service.quantity,
          unit_price: service.unitPrice,
          total_price: service.quantity * service.unitPrice,
          billing_cycle: service.billingCycle || 'once',
          display_order: tierIndex * 1000 + serviceIndex,
          tier_name: tier.name || `Tier ${tierIndex + 1}`
        })
      })
    })

    if (allLineItems.length > 0) {
      proposalsLogger.info('Insertando líneas de servicio', { count: allLineItems.length })
      
      const { error: lineItemsError } = await supabase
        .from('proposal_line_items')
        .insert(allLineItems)

      if (lineItemsError) {
        proposalsLogger.error('Error al insertar líneas de servicio', { error: lineItemsError })
        throw lineItemsError
      }

      proposalsLogger.info('Líneas de servicio insertadas')
    }

    return proposal

  } catch (error) {
    proposalsLogger.error('Error en saveProposal', { error })
    throw error
  }
}