/**
 * Contacts Feature Module
 * 
 * Gestión de contactos, personas y empresas
 */

// Components (pages)
export { default as ContactsPage } from './pages/ContactsPage'

// Components
export { ContactsList } from './components/ContactsList'
export { ContactFilters } from './components/ContactFilters'
export { VirtualizedContactTable } from './components/VirtualizedContactTable'
export { ContactEmptyState } from './components/ContactEmptyState'
export { ContactFormDialog } from './components/ContactFormDialog'
export { ContactsDialogManager } from './components/ContactsDialogManager'
export { QuantumImportDialog } from './components/QuantumImportDialog'

// Hooks
export { useContactsList } from './hooks'
export { useContactsQueries, useContactsActions, useContactFormState, useContactFormSubmit } from './hooks'

export type { Contact } from '@/hooks/useContacts'