/**
 * Billing Feature Module
 * Punto de entrada centralizado para toda la funcionalidad de facturación
 */

// Re-exports de componentes principales
export { InvoicesList } from './components'
export { InvoiceForm } from './components'
export { RecurringFeesList } from './components'
export { RecurringFeeForm } from './components'
export { PaymentTracking } from './components'
export { BillingStats } from './components'
export { BillingReports } from './components'

// Re-exports de hooks
export * from './hooks'

// Explicit re-export to ensure proper module resolution
export { useRecurringFeesOverdue } from '@/hooks/useRecurringFeesOverdue'

// Re-exports de tipos específicos para evitar conflictos
export type {
  Invoice,
  InvoiceLineItem,
  Payment,
  BillingMetrics,
  BillingFilters,
  INVOICE_STATUSES,
  PAYMENT_METHODS,
  RECURRING_FREQUENCIES,
  RECURRING_FEE_STATUSES
} from './types'