/**
 * Tipos para el módulo de casos/expedientes
 */

import { BaseEntity, User } from '../core'
import { Contact } from './contacts'

export type CaseStatus = 'active' | 'closed' | 'archived' | 'on_hold'
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent'
export type CaseType = 'legal' | 'fiscal' | 'laboral' | 'mercantil' | 'other'

export interface Case extends BaseEntity {
  case_number: string
  title: string
  description: string
  client_id: string
  assigned_user_id: string | null
  status: CaseStatus
  priority: CasePriority
  case_type: CaseType
  due_date: string | null
  estimated_hours: number | null
  actual_hours: number | null
  hourly_rate: number | null
  tags: string[] | null
  internal_notes: string | null
  client?: Contact
  assigned_user?: User
}

export interface CaseWizardStep {
  title: string
  completed: boolean
  data: Record<string, unknown>
}

export interface CaseWizardData {
  client_selection: {
    client_id: string
    client: Contact | null
  }
  case_details: {
    title: string
    description: string
    case_type: CaseType
    priority: CasePriority
    due_date: string | null
    estimated_hours: number | null
    hourly_rate: number | null
    tags: string[]
  }
  assignment: {
    assigned_user_id: string | null
    assigned_user: User | null
  }
}

export interface CreateCaseData {
  title: string
  description: string
  client_id: string
  case_type: CaseType
  priority: CasePriority
  due_date?: string
  estimated_hours?: number
  hourly_rate?: number
  assigned_user_id?: string
  tags?: string[]
  internal_notes?: string
}

export interface UpdateCaseData extends Partial<CreateCaseData> {
  status?: CaseStatus
  actual_hours?: number
}

export interface CaseFilters {
  status?: CaseStatus[]
  priority?: CasePriority[]
  case_type?: CaseType[]
  assigned_user_id?: string
  client_id?: string
  tags?: string[]
  search?: string
  due_date_range?: {
    start: string
    end: string
  }
}