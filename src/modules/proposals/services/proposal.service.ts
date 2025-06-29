
import { supabase } from '@/integrations/supabase/client'
import { ProposalFormData } from '../types/proposal.schema'

interface ProposalInsertData {
  title: string
  contact_id: string  // Changed from client_id to contact_id
  org_id: string
  created_by: string
  status: 'draft'
  introduction?: string
  scope_of_work?: string
  timeline?: string
  currency: 'EUR' | 'USD' | 'GBP'
  valid_until?: string
  pricing_tiers_data: any
  total_amount: number
  // Campos para propuestas recurrentes
  is_recurring?: boolean
  recurring_frequency?: string
  contract_start_date?: string
  contract_end_date?: string
  auto_renewal?: boolean
  retainer_amount?: number
  included_hours?: number
  hourly_rate_extra?: number
  billing_day?: number
}

export const saveProposal = async (
  formData: ProposalFormData,
  orgId: string,
  userId: string
): Promise<any> => {
  const grandTotal = formData.pricingTiers.reduce((total, tier) => {
    return total + tier.services.reduce((tierTotal, service) => {
      return tierTotal + (service.quantity * service.unitPrice)
    }, 0)
  }, 0)

  console.log('Preparando datos para guardar:', {
    is_recurring: formData.is_recurring,
    recurring_frequency: formData.recurring_frequency
  });

  const proposalInsertData: ProposalInsertData = {
    title: formData.title,
    contact_id: formData.clientId,  // Changed from client_id to contact_id
    org_id: orgId,
    created_by: userId,
    status: 'draft',
    introduction: formData.introduction || '',
    scope_of_work: formData.scopeOfWork || '',
    timeline: formData.timeline || '',
    currency: formData.currency,
    valid_until: formData.validUntil.toISOString(),
    pricing_tiers_data: formData.pricingTiers,
    total_amount: grandTotal,
    // Campos recurrentes - CORREGIDO
    is_recurring: Boolean(formData.is_recurring),
    recurring_frequency: formData.is_recurring ? formData.recurring_frequency : null,
    contract_start_date: formData.contract_start_date?.toISOString().split('T')[0],
    contract_end_date: formData.contract_end_date?.toISOString().split('T')[0],
    auto_renewal: formData.auto_renewal || false,
    retainer_amount: formData.retainer_amount || 0,
    included_hours: formData.included_hours || 0,
    hourly_rate_extra: formData.hourly_rate_extra || 0,
    billing_day: formData.billing_day || 1,
  }

  console.log('Datos finales a insertar:', proposalInsertData);

  const { data, error } = await supabase
    .from('proposals')
    .insert(proposalInsertData)
    .select()
    .single()

  if (error) {
    console.error('Error en la base de datos:', error);
    throw new Error(error.message);
  }
  
  console.log('Propuesta guardada en BD:', data);
  return data
}
