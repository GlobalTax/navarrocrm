/**
 * Sistema de logging profesional centralizado
 * Reemplaza todos los console.log dispersos en la aplicación
 */

// Export primary logger
export { logger, createLogger } from './production-logger'
export type { LogLevel } from './production-logger'

// Re-export context loggers
export { 
  authLogger, 
  appLogger, 
  routeLogger, 
  profileLogger, 
  sessionLogger, 
  setupLogger,
  performanceLogger,
  aiLogger,
  contactsLogger,
  documentsLogger,
  globalLogger,
  proposalsLogger,
  casesLogger,
  tasksLogger,
  invoicesLogger,
  quantumLogger
} from './context-loggers'