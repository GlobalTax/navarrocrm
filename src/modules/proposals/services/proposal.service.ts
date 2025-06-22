
import { supabase } from '@/integrations/supabase/client';
import { ProposalFormData } from '../types/proposal.schema';

interface ProposalInsertData {
  title: string;
  client_id: string;
  org_id: string;
  created_by: string;
  status: 'draft';
  introduction?: string;
  scope_of_work?: string;
  timeline?: string;
  currency: 'EUR' | 'USD' | 'GBP';
  valid_until?: string;
  pricing_tiers_data: any;
  total_amount: number;
}

export const saveProposal = async (
  formData: ProposalFormData,
  orgId: string,
  userId: string
): Promise<any> => {
  const grandTotal = formData.pricingTiers.reduce((total, tier) => {
    return total + tier.services.reduce((tierTotal, service) => {
      return tierTotal + (service.quantity * service.unitPrice);
    }, 0);
  }, 0);

  const proposalInsertData: ProposalInsertData = {
    title: formData.title,
    client_id: formData.clientId,
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
  };

  const { data, error } = await supabase
    .from('proposals')
    .insert(proposalInsertData)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};
