
export * from './types'
export * from './base'
export * from './contacts'
export * from './proposals'

// Re-export instances for easy access
export { contactsDAL } from './contacts'
export { proposalsDAL } from './proposals'

// Re-export types for convenience
export type { Contact, Client } from '@/types/shared/clientTypes'
