/**
 * Loggers especializados por contexto
 * Reemplazan todos los console.log específicos de cada módulo
 */

import { createLogger } from './production-logger'

// Loggers por módulo - reemplazan los console.log existentes
export const authLogger = createLogger('Auth')
export const appLogger = createLogger('App')
export const routeLogger = createLogger('Route')
export const profileLogger = createLogger('Profile')
export const sessionLogger = createLogger('Session')
export const setupLogger = createLogger('Setup')
export const aiLogger = createLogger('AI')
export const proposalsLogger = createLogger('Proposals')
export const contactsLogger = createLogger('Contacts')
export const casesLogger = createLogger('Cases')
export const documentsLogger = createLogger('Documents')
export const invoicesLogger = createLogger('Invoices')
export const tasksLogger = createLogger('Tasks')
export const bulkUploadLogger = createLogger('BulkUpload')
export const performanceLogger = createLogger('Performance')
export const memoryLogger = createLogger('Memory')
export const quantumLogger = createLogger('Quantum')
export const workflowLogger = createLogger('Workflow')
export const recurringFeesLogger = createLogger('RecurringFees')
export const globalLogger = createLogger('Global')

// Logger por defecto para casos generales
export const logger = globalLogger