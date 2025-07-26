/**
 * Tipos para el sistema de logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type LogContext = 
  | 'Auth'
  | 'App'
  | 'Route'
  | 'Profile'
  | 'Session'
  | 'Setup'
  | 'AI'
  | 'Proposals'
  | 'Contacts'
  | 'Cases'
  | 'Documents'
  | 'Invoices'
  | 'Tasks'
  | 'BulkUpload'
  | 'Performance'
  | 'Memory'
  | 'Quantum'
  | 'Workflow'
  | 'Global'

export interface LogEntry {
  level: LogLevel
  context: LogContext
  message: string
  data?: Record<string, unknown>
  timestamp: Date
  userId?: string
  orgId?: string
  sessionId?: string
  url?: string
  userAgent?: string
}

export interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  context: LogContext
  includeMetadata: boolean
  sendToProduction: boolean
}

export interface ProductionLogEntry {
  level: LogLevel
  context: LogContext
  message: string
  data?: Record<string, unknown>
  metadata: {
    timestamp: string
    userId?: string
    orgId?: string
    sessionId?: string
    url: string
    userAgent: string
    environment: string
  }
}