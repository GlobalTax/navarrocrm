/**
 * Tipos para el módulo de propuestas
 */

import { BaseEntity, User } from '../core'

export type ProposalStatus = 
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'declined'
  | 'invoiced'
  | 'archived'

export type BillingCycle = 'once' | 'monthly' | 'annually' | 'quarterly'

export type Currency = 'EUR' | 'USD' | 'GBP'

export interface ServiceItem {
  id: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  billingCycle: BillingCycle
  taxable: boolean
}

export interface PricingTier {
  id: string
  name: string
  description: string
  services: ServiceItem[]
  isFeatured?: boolean
  totalPrice: number
}

export interface ProposalLineItem {
  id: string
  proposal_id: string
  service_name: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  billing_cycle: BillingCycle
  taxable: boolean
  created_at: string
}

export interface Proposal extends BaseEntity {
  proposal_number: string
  title: string
  client_id: string
  status: ProposalStatus
  introduction: string
  scope_of_work: string
  timeline: string
  subtotal: number
  tax_amount: number
  total: number
  currency: Currency
  sent_at?: string
  valid_until: string
  accepted_at?: string
  created_by_user_id: string
  version: number
  line_items?: ProposalLineItem[]
}

export interface ProposalHistory {
  id: string
  proposal_id: string
  action: string
  old_value: Record<string, unknown>
  new_value: Record<string, unknown>
  created_by_user_id: string
  created_at: string
  user?: User
}

export interface ProposalFilters {
  status?: ProposalStatus[]
  client_id?: string
  created_by?: string
  date_range?: {
    start: string
    end: string
  }
}

export interface ProposalMetrics {
  total: number
  byStatus: Record<ProposalStatus, number>
  totalValue: number
  averageValue: number
  conversionRate: number
}

export interface CreateProposalData {
  title: string
  client_id: string
  introduction: string
  scope_of_work: string
  timeline: string
  currency: Currency
  valid_until: string
  line_items: Omit<ProposalLineItem, 'id' | 'proposal_id' | 'created_at'>[]
}

export interface UpdateProposalData extends Partial<CreateProposalData> {
  status?: ProposalStatus
}