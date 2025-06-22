
export interface RecurringFeeFormData {
  client_id: string
  name: string
  description?: string
  amount: number
  frequency: 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date?: string
  billing_day: number
  included_hours: number
  hourly_rate_extra: number
  auto_invoice: boolean
  auto_send_notifications: boolean
  payment_terms: number
  priority: 'high' | 'medium' | 'low'
  internal_notes?: string
  tags: string[]
}
