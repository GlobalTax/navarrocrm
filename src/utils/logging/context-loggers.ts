/**
 * Loggers especializados por contexto
 * Reemplazan todos los console.log específicos de cada módulo
 */

import { createContextLogger } from './logger'

// Loggers por módulo - reemplazan los console.log existentes
export const authLogger = createContextLogger('Auth')
export const appLogger = createContextLogger('App')
export const routeLogger = createContextLogger('Route')
export const profileLogger = createContextLogger('Profile')
export const sessionLogger = createContextLogger('Session')
export const setupLogger = createContextLogger('Setup')
export const aiLogger = createContextLogger('AI')
export const proposalsLogger = createContextLogger('Proposals')
export const contactsLogger = createContextLogger('Contacts')
export const casesLogger = createContextLogger('Cases')
export const documentsLogger = createContextLogger('Documents')
export const invoicesLogger = createContextLogger('Invoices')
export const tasksLogger = createContextLogger('Tasks')
export const bulkUploadLogger = createContextLogger('BulkUpload')
export const performanceLogger = createContextLogger('Performance')
export const memoryLogger = createContextLogger('Memory')
export const quantumLogger = createContextLogger('Quantum')
export const workflowLogger = createContextLogger('Workflow')
export const globalLogger = createContextLogger('Global')

// Logger por defecto para casos generales
export const logger = globalLogger