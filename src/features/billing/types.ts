/**
 * Types para el módulo de Billing
 */

export interface Invoice {
  id: string
  invoice_number: string
  contact_id: string
  case_id?: string
  proposal_id?: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  subtotal: number
  tax_amount: number
  total_amount: number
  currency: string
  issue_date: string
  due_date: string
  paid_date?: string
  payment_method?: string
  notes?: string
  terms?: string
  created_by: string
  org_id: string
  created_at: string
  updated_at: string
  // Relaciones
  contact?: {
    id: string
    name: string
    email?: string
  }
  case?: {
    id: string
    title: string
  }
  line_items?: InvoiceLineItem[]
}

export interface InvoiceLineItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  tax_rate?: number
  sort_order: number
}

export interface RecurringFee {
  id: string
  name: string
  description?: string
  contact_id: string
  proposal_id?: string
  amount: number
  currency: string
  frequency: 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date?: string
  next_billing_date: string
  billing_day: number
  included_hours?: number
  hourly_rate_extra?: number
  auto_invoice: boolean
  auto_send_notifications: boolean
  payment_terms: number
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'paused' | 'cancelled' | 'completed'
  created_by: string
  org_id: string
  created_at: string
  updated_at: string
  // Relaciones
  contact?: {
    id: string
    name: string
    email?: string
  }
  proposal?: {
    id: string
    title: string
  }
}

export interface Payment {
  id: string
  invoice_id: string
  amount: number
  currency: string
  payment_method: 'transfer' | 'card' | 'cash' | 'check' | 'other'
  payment_date: string
  reference?: string
  notes?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_by: string
  org_id: string
  created_at: string
  updated_at: string
}

export interface BillingMetrics {
  total_invoices: number
  total_revenue: number
  outstanding_amount: number
  overdue_amount: number
  paid_invoices: number
  unpaid_invoices: number
  average_invoice_value: number
  payment_rate: number
  recurring_revenue: number
  one_time_revenue: number
  revenue_by_month: Array<{
    month: string
    revenue: number
    invoices: number
  }>
}

export interface BillingFilters {
  search: string
  status: Invoice['status'] | 'all'
  contact_id: string | 'all'
  date_range: {
    start: string
    end: string
  } | null
  amount_range: {
    min: number
    max: number
  } | null
}

export interface RecurringFeeFilters {
  search: string
  status: RecurringFee['status'] | 'all'
  frequency: RecurringFee['frequency'] | 'all'
  contact_id: string | 'all'
  priority: RecurringFee['priority'] | 'all'
}

// Constantes útiles
export const INVOICE_STATUSES = {
  draft: 'Borrador',
  sent: 'Enviada',
  paid: 'Pagada',
  overdue: 'Vencida',
  cancelled: 'Cancelada'
} as const

export const PAYMENT_METHODS = {
  transfer: 'Transferencia',
  card: 'Tarjeta',
  cash: 'Efectivo',
  check: 'Cheque',
  other: 'Otro'
} as const

export const RECURRING_FREQUENCIES = {
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  yearly: 'Anual'
} as const

export const RECURRING_FEE_STATUSES = {
  active: 'Activa',
  paused: 'Pausada',
  cancelled: 'Cancelada',
  completed: 'Completada'
} as const