/**
 * Types para el feature de Time Tracking
 */

export interface TimeEntry {
  id: string
  org_id: string
  user_id: string
  case_id?: string | null
  description: string | null
  duration_minutes: number
  is_billable: boolean
  created_at: string | null
  updated_at: string | null
  entry_type?: string | null
}

export interface TimerState {
  isRunning: boolean
  isPaused: boolean
  seconds: number
  startTime: Date | null
  description: string
  caseId?: string
  contactId?: string
  isBillable: boolean
}

export interface TimeTrackingStats {
  totalHours: number
  billableHours: number
  nonBillableHours: number
  totalEarnings: number
  averageHourlyRate: number
  entriesCount: number
}

export interface CreateTimeEntryData {
  case_id?: string
  description: string
  duration_minutes: number
  is_billable: boolean
  entry_type?: string
}

export interface UpdateTimeEntryData extends Partial<CreateTimeEntryData> {
  id: string
}

export interface TimeTrackingFilters {
  dateRange?: {
    start: string
    end: string
  }
  userId?: string
  caseId?: string
  isBillable?: boolean
  entryType?: string
}

export interface TimeTemplate {
  id: string
  name: string
  description: string
  duration_minutes: number
  is_billable: boolean
  tags: string[]
  user_id: string
  org_id: string
  created_at: string
}