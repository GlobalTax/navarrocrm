/**
 * Types para el módulo de Proposals
 */

// Re-export de tipos existentes
export type {
  Proposal,
  CreateProposalData,
  ProposalLineItem,
  ContactInfo,
  PricingTierData
} from '@/types/proposals'

// Tipos adicionales definidos aquí
export type ProposalStatus = 'draft' | 'sent' | 'negotiating' | 'won' | 'lost' | 'expired' | 'viewed' | 'accepted' | 'declined' | 'invoiced' | 'archived'
export type ProposalType = 'service' | 'retainer' | 'project'

import type { CreateProposalData, ProposalLineItem } from '@/types/proposals'

export interface UpdateProposalData extends Partial<CreateProposalData> {
  id: string
}

export interface ProposalFilters {
  search: string
  status: ProposalStatus | 'all'
  type: ProposalType | 'all'
  contact_id: string | 'all'
  date_range: {
    start: string
    end: string
  } | null
}

export interface ProposalStats {
  total_proposals: number
  won_proposals: number
  lost_proposals: number
  pending_proposals: number
  draft_proposals: number
  total_value: number
  won_value: number
  conversion_rate: number
  average_deal_size: number
}

// Tipos adicionales para el módulo
export interface ProposalWizardStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
  isCompleted: boolean
  isOptional?: boolean
}

export interface ProposalTemplate {
  id: string
  name: string
  description: string
  line_items: Omit<ProposalLineItem, 'id' | 'proposal_id'>[]
  terms_text?: string
  introduction_text?: string
  practice_area: string
  created_by: string
  org_id: string
  created_at: string
  updated_at: string
}

export interface ProposalPhase {
  id: string
  name: string
  description: string
  estimated_duration: number
  hourly_rate: number
  deliverables: string[]
  is_optional: boolean
  dependencies: string[]
}

export interface ProposalMetrics {
  total_proposals: number
  won_proposals: number
  lost_proposals: number
  pending_proposals: number
  draft_proposals: number
  total_value: number
  won_value: number
  conversion_rate: number
  average_deal_size: number
}

// Constantes útiles
export const PROPOSAL_STATUSES = {
  draft: 'Borrador',
  sent: 'Enviada',
  viewed: 'Visualizada',
  won: 'Ganada',
  lost: 'Perdida',
  expired: 'Expirada'
} as const

export const PROPOSAL_TYPES = {
  one_time: 'Proyecto único',
  recurring: 'Recurrente',
  retainer: 'Retainer'
} as const