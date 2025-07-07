
export interface RecurringFee {
  id: string
  org_id: string
  client_id: string
  proposal_id?: string
  name: string
  description?: string
  amount: number
  frequency: 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date?: string
  next_billing_date: string
  status: 'active' | 'paused' | 'cancelled' | 'completed'
  billing_day: number
  included_hours: number
  hourly_rate_extra: number
  auto_invoice: boolean
  auto_send_notifications: boolean
  payment_terms: number
  priority: 'high' | 'medium' | 'low'
  tags?: string[]
  internal_notes?: string
  created_at: string
  updated_at: string
  created_by: string
  client?: {
    name: string
    email?: string
  }
  proposal?: {
    id: string
    title: string
    proposal_number?: string
    status: string
    created_at: string
    total_amount?: number
  }
}

export interface RecurringFeeHours {
  id: string
  recurring_fee_id: string
  billing_period_start: string
  billing_period_end: string
  included_hours: number
  hours_used: number
  extra_hours: number
  hourly_rate?: number
  extra_amount: number
  created_at: string
  updated_at: string
}

export interface RecurringFeeInvoice {
  id: string
  recurring_fee_id: string
  invoice_number?: string
  invoice_date: string
  due_date: string
  billing_period_start: string
  billing_period_end: string
  base_amount: number
  extra_hours_amount: number
  total_amount: number
  status: 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  sent_at?: string
  paid_at?: string
  payment_method?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface RecurringFeeFilters {
  status?: string
  client_id?: string
  frequency?: string
  priority?: string
}
