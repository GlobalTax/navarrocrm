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

// Hooks
export { useContactsList } from './hooks'

export type { Contact } from '@/hooks/useContacts'
// Types
// export type {
//   Contact,
//   Person,
//   Company,
//   ContactForm
// } from './types'