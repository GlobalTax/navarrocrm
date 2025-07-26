/**
 * Tipos para el módulo de facturación
 */

import { BaseEntity } from '../core'

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type PaymentStatus = 'pending' | 'partial' | 'completed' | 'failed'

export interface InvoiceLine {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  total_amount: number
}

export interface Invoice extends BaseEntity {
  invoice_number: string
  client_id: string
  case_id?: string
  status: InvoiceStatus
  payment_status: PaymentStatus
  issue_date: string
  due_date: string
  subtotal: number
  tax_amount: number
  total_amount: number
  currency: string
  notes?: string
  payment_terms?: string
  sent_at?: string
  paid_at?: string
  invoice_lines: InvoiceLine[]
  quantum_data?: Record<string, unknown>
}

export interface QuantumInvoiceData {
  invoice_lines: Array<{
    description: string
    quantity: number
    unit_price: number
    tax_rate: number
  }>
  quantum_data: {
    client_data: Record<string, unknown>
    billing_period: {
      start: string
      end: string
    }
    analytics: {
      efficiency_score: number
      time_distribution: Record<string, number>
      cost_breakdown: Record<string, number>
    }
  }
}

export interface InvoiceFilters {
  status?: InvoiceStatus[]
  payment_status?: PaymentStatus[]
  client_id?: string
  case_id?: string
  date_range?: {
    start: string
    end: string
  }
  amount_range?: {
    min: number
    max: number
  }
}

export interface InvoiceMetrics {
  total_invoices: number
  total_amount: number
  paid_amount: number
  pending_amount: number
  overdue_amount: number
  average_payment_time: number
  by_status: Record<InvoiceStatus, number>
  by_month: Array<{
    month: string
    total: number
    amount: number
  }>
}