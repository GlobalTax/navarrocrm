/**
 * Invoices Feature Module
 * 
 * Gestión de facturación y pagos
 */

// Components (pages)
export { default as InvoicesPage } from './pages/InvoicesPage'

// Components
export { InvoicesList } from './components/InvoicesList'
export { InvoiceFilters } from './components/InvoiceFilters'
export { InvoiceFormDialog } from './components/InvoiceFormDialog'

// Hooks
export { useInvoicesList, useInvoicesQueries, useInvoicesActions } from './hooks'

// Types (placeholder)
// export type {
//   Invoice,
//   InvoiceItem,
//   PaymentStatus
// } from './types'