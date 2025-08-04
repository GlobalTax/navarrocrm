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
export { ContactsService, contactsService } from './contacts'
export { useContacts, useContactsList, useContactsMutations } from './contacts'
export type { Contact, Person, Company, ContactFormData, ContactSearchParams } from './contacts'