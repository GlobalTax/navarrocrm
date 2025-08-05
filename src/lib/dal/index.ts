
// Core DAL exports
export * from './types'
export * from './base'

// Entity DAL exports
export * from './contacts'
export * from './proposals'
export * from './cases'
export * from './calendar'
export * from './documents'
export * from './users'
export * from './time-entries'
export * from './tasks'
export * from './analytics'
// Employee DAL modules removed

// Re-export instances for easy access
export { contactsDAL } from './contacts'
export { proposalsDAL } from './proposals'
export { casesDAL } from './cases'
export { calendarDAL } from './calendar'
export { documentsDAL, documentTemplatesDAL } from './documents'
export { usersDAL, userInvitationsDAL } from './users'
export { timeEntriesDAL } from './time-entries'
export { tasksDAL } from './tasks'
export { analyticsDAL } from './analytics'
// Employee DAL exports removed

// Re-export types for convenience
export type { Contact, Client } from '@/types/shared/clientTypes'
export type { Case } from './cases'
export type { CalendarEvent } from './calendar'
export type { Document, DocumentTemplate, DocumentVersion } from './documents'
export type { User, UserInvitation } from './users'
export type { TimeEntry, TimeReport } from './time-entries'
export type { Task, CreateTaskData } from './tasks'
export type { AnalyticsError, SecurityEvent, CreateAnalyticsErrorData } from './analytics'
// Employee type exports removed
