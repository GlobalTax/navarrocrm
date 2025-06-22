
export interface Case {
  id: string
  title: string
  description: string | null
  status: string
  client_id: string
  org_id: string
  practice_area: string | null
  responsible_solicitor_id: string | null
  originating_solicitor_id: string | null
  matter_number: string | null
  billing_method: string
  estimated_budget: number | null
  date_opened: string | null
  date_closed: string | null
  template_id: string | null
  created_at: string
  updated_at: string | null
  client?: {
    name: string
    email: string | null
  }
  responsible_solicitor?: {
    email: string
  }
  originating_solicitor?: {
    email: string
  }
}

export interface CreateCaseData {
  title: string
  description?: string
  status: string
  client_id: string
  practice_area?: string
  responsible_solicitor_id?: string
  originating_solicitor_id?: string
  billing_method?: string
  estimated_budget?: number
  template_id?: string
}
