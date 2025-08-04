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
export { useBilling } from './hooks'
export { useInvoices } from './hooks'
export { useRecurringFees } from './hooks'
export { usePayments } from './hooks'

// Re-exports de tipos
export type {
  Invoice,
  RecurringFee,
  Payment,
  BillingMetrics,
  InvoiceLineItem
} from './types'