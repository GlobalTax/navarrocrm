
export type ProposalStatus = 
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'declined'
  | 'invoiced'
  | 'archived';

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  billingCycle: 'once' | 'monthly' | 'annually' | 'quarterly';
  taxable: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  services: ServiceItem[];
  isFeatured?: boolean;
  totalPrice: number;
}

export interface EnhancedProposal {
  id: string;
  proposalNumber: string;
  title: string;
  clientId: string;
  status: ProposalStatus;
  introduction: string;
  scopeOfWork: string;
  timeline: string;
  pricingTiers: PricingTier[];
  selectedTierId?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: 'EUR' | 'USD' | 'GBP';
  createdAt: string;
  sentAt?: string;
  validUntil: string;
  acceptedAt?: string;
  createdByUserId: string;
  version: number;
}
