
export interface Proposal {
  id: string
  org_id: string
  contact_id: string // Real field in DB
  client_id?: string  // Computed field for compatibility
  title: string
  description?: string
  status: 'draft' | 'sent' | 'negotiating' | 'won' | 'lost' | 'expired' | 'viewed' | 'accepted' | 'declined' | 'invoiced' | 'archived'
  total_amount: number
  currency: string
  proposal_type: 'service' | 'retainer' | 'project'
  valid_until?: string
  sent_at?: string
  accepted_at?: string
  created_by: string
  assigned_to?: string
  notes?: string
  // Campos recurrentes
  is_recurring?: boolean
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly'
  contract_start_date?: string
  contract_end_date?: string
  auto_renewal?: boolean
  retainer_amount?: number
  included_hours?: number
  hourly_rate_extra?: number
  next_billing_date?: string
  billing_day?: number
  // Nuevos campos
  proposal_number?: string
  introduction?: string
  scope_of_work?: string
  timeline?: string
  pricing_tiers_data?: PricingTierData[] | any // Flexible to handle DB Json type
  created_at: string
  updated_at: string
  // Contact/Client data from join
  contact?: ContactInfo
  client?: ContactInfo  // Alias for compatibility
  line_items?: ProposalLineItem[]
}

export interface ContactInfo {
  id: string
  name: string
  email?: string
  phone?: string
  dni_nif?: string
}

export interface PricingTierData {
  id: string
  name: string
  description?: string
  price: number
  features: string[]
  recommended?: boolean
}

export interface ProposalLineItem {
  id: string
  proposal_id: string
  service_catalog_id?: string
  name: string
  description?: string
  quantity: number
  unit_price: number
  total_price: number
  billing_unit: string
  sort_order: number
  discount_type?: 'percentage' | 'fixed' | null
  discount_value?: number
  discount_amount?: number
}

export interface CreateProposalData {
  contact_id: string
  title: string
  description?: string
  proposal_type?: 'service' | 'retainer' | 'project'
  valid_until?: string
  assigned_to?: string
  notes?: string
  // Campos recurrentes
  is_recurring?: boolean
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly'
  contract_start_date?: string
  contract_end_date?: string
  auto_renewal?: boolean
  retainer_amount?: number
  included_hours?: number
  hourly_rate_extra?: number
  billing_day?: number
  next_billing_date?: string
  line_items: Omit<ProposalLineItem, 'id' | 'proposal_id'>[]
}
