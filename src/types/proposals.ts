
export interface Proposal {
  id: string
  org_id: string
  client_id: string
  title: string
  description?: string
  status: 'draft' | 'sent' | 'negotiating' | 'won' | 'lost' | 'expired'
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
  created_at: string
  updated_at: string
  client?: {
    name: string
    email?: string
  }
  line_items?: ProposalLineItem[]
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
}

export interface CreateProposalData {
  client_id: string
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
