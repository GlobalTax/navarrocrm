/**
 * Central exports for all features
 */

// Auth feature
export * from './auth'

// Documents feature  
export * from './documents'

// Time Tracking feature
export * from './time-tracking'

// Cases feature
export * from './cases'

// Contacts feature - explicit exports to avoid conflicts  
export { contactsService } from './contacts'
export { useContacts, useContactsList, usePersons, useCompanies } from './contacts'
export type { Contact, Person, Company, ContactFormData, ContactSearchParams } from './contacts'
export { validateNifCif, formatNifCif, getContactDisplayName } from './contacts'