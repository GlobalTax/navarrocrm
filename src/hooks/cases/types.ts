
export interface Case {
  id: string
  title: string
  description: string | null
  status: 'open' | 'on_hold' | 'closed'
  contact_id: string | null
  practice_area: string | null
  responsible_solicitor_id: string | null
  originating_solicitor_id: string | null
  billing_method: 'hourly' | 'fixed' | 'contingency' | 'retainer'
  estimated_budget: number | null
  created_at: string
  updated_at: string
  org_id: string
  created_by: string | null
  contact?: {
    id: string
    name: string
    email: string | null
    phone: string | null
  }
}

export interface CreateCaseData {
  title: string
  description?: string
  status: 'open' | 'on_hold' | 'closed'
  contact_id?: string
  practice_area?: string
  responsible_solicitor_id?: string
  originating_solicitor_id?: string
  billing_method: 'hourly' | 'fixed' | 'contingency' | 'retainer'
  estimated_budget?: number
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
