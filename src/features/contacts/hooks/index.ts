/**
 * Contacts Hooks Barrel Export
 */

export { useContacts } from './useContacts'
export { usePersons } from './usePersons'
export { useCompanies } from './useCompanies'
export { useContactsList } from './useContactsList'
export { useContactSearch, useContactByEmail, useClients } from './useContacts'

// Re-export types for convenience
export type { Contact, Person, Company, ContactFormData } from '../types'