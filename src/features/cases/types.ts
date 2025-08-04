/**
 * Types para el módulo de casos/expedientes
 */

import { BaseEntity, User } from '@/types/core'
import { Contact } from '@/features/contacts'

export type CaseStatus = 'open' | 'on_hold' | 'closed'
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent'
export type CaseType = 'legal' | 'fiscal' | 'laboral' | 'mercantil' | 'other'
export type BillingMethod = 'hourly' | 'fixed' | 'contingency' | 'retainer'

export interface Case extends BaseEntity {
  title: string
  description: string | null
  status: CaseStatus
  contact_id: string | null
  practice_area: string | null
  responsible_solicitor_id: string | null
  originating_solicitor_id: string | null
  billing_method: BillingMethod
  estimated_budget: number | null
  matter_number: string | null
  date_opened: string | null
  date_closed: string | null
  template_id: string | null
  primary_contact_email: string | null
  communication_preferences: {
    auto_updates: boolean
    milestone_notifications: boolean
  }
  last_email_sent_at: string | null
  contact?: Contact
  responsible_solicitor?: User
  originating_solicitor?: User
}

export interface CreateCaseData {
  title: string
  description?: string
  status: CaseStatus
  contact_id?: string
  practice_area?: string
  responsible_solicitor_id?: string
  originating_solicitor_id?: string
  billing_method: BillingMethod
  estimated_budget?: number
  template_selection?: string
}

export interface UpdateCaseData extends Partial<CreateCaseData> {
  id: string
}

export interface CaseFilters {
  search: string
  status: string
  practice_area: string
  responsible_solicitor: string
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

export interface CaseSearchParams {
  search?: string
  status?: CaseStatus[]
  practice_area?: string[]
  responsible_solicitor_id?: string
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
}

export interface CaseStats {
  total: number
  open: number
  closed: number
  on_hold: number
}

export interface CaseFormData {
  title: string
  description?: string
  status: CaseStatus
  contact_id: string
  practice_area?: string
  responsible_solicitor_id?: string
  originating_solicitor_id?: string
  billing_method: BillingMethod
  estimated_budget?: number
  template_selection: string
}