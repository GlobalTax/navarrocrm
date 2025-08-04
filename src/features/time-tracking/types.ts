/**
 * Types para el módulo de Time Tracking
 */

export interface TimeEntry {
  id: string
  org_id: string
  user_id: string
  case_id: string | null
  description: string | null
  duration_minutes: number
  is_billable: boolean
  entry_type: 'billable' | 'office_admin' | 'business_development' | 'internal'
  created_at: string
  updated_at: string
  case?: {
    id: string
    title: string
    contact: {
      id: string
      name: string
    }
  }
}

export interface CreateTimeEntryData {
  case_id?: string
  description?: string
  duration_minutes: number
  is_billable?: boolean
  entry_type?: 'billable' | 'office_admin' | 'business_development' | 'internal'
}

export interface UpdateTimeEntryData extends Partial<CreateTimeEntryData> {
  id: string
}

export interface TimeTrackingFilters {
  search: string
  case_id: string
  is_billable: 'all' | 'billable' | 'non-billable'
  entry_type: string
  date_range: {
    start: string
    end: string
  } | null
}

export interface TimeTrackingStats {
  total_hours: number
  billable_hours: number
  non_billable_hours: number
  total_entries: number
  utilization_rate: number
  avg_entry_duration: number
  entries_by_type: Record<string, number>
  daily_breakdown: Array<{
    date: string
    hours: number
    billable_hours: number
  }>
}

export interface TimerState {
  isRunning: boolean
  isPaused: boolean
  seconds: number
  startTime: Date | null
  case_id: string | null
  description: string
}

// Constantes útiles
export const ENTRY_TYPES = {
  billable: 'Tiempo facturable',
  office_admin: 'Administración',
  business_development: 'Desarrollo comercial',
  internal: 'Trabajo interno'
} as const

export const BILLABLE_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'billable', label: 'Solo facturables' },
  { value: 'non-billable', label: 'Solo no facturables' }
] as const