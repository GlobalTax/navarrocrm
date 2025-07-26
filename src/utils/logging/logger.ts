/**
 * Logger principal del sistema
 */

import { LogLevel, LogContext, LogEntry, LoggerConfig, ProductionLogEntry } from './types'

class ProfessionalLogger {
  private isDevelopment = import.meta.env.DEV
  private logs: LogEntry[] = []
  private maxLogs = 1000

  constructor() {
    // Limpieza automática cada 5 minutos
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), 5 * 60 * 1000)
    }
  }

  private shouldLog(level: LogLevel, config: LoggerConfig): boolean {
    if (!config.enabled) return false
    
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    }
    
    return levels[level] >= levels[config.level]
  }

  private formatMessage(level: LogLevel, context: LogContext, message: string): string {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    const emoji = this.getEmoji(level, context)
    return `${emoji} ${timestamp} [${context}] ${message}`
  }

  private getEmoji(level: LogLevel, context: LogContext): string {
    const contextEmojis: Record<LogContext, string> = {
      Auth: '🔐',
      App: '🚀',
      Route: '🔒',
      Profile: '👤',
      Session: '📋',
      Setup: '🔧',
      AI: '🤖',
      Proposals: '📄',
      Contacts: '👥',
      Cases: '📂',
      Documents: '📝',
      Invoices: '💰',
      Tasks: '✅',
      BulkUpload: '📤',
      Performance: '⚡',
      Memory: '🧠',
      Quantum: '⚛️',
      Workflow: '🔄',
      Global: 'ℹ️'
    }
    
    const levelEmojis: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    }
    
    return contextEmojis[context] || levelEmojis[level]
  }

  private createLogEntry(
    level: LogLevel,
    context: LogContext,
    message: string,
    data?: Record<string, unknown>
  ): LogEntry {
    return {
      level,
      context,
      message,
      data,
      timestamp: new Date(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    }
  }

  private log(
    level: LogLevel,
    context: LogContext,
    message: string,
    data?: Record<string, unknown>,
    config: LoggerConfig = {
      enabled: this.isDevelopment,
      level: 'info',
      context,
      includeMetadata: true,
      sendToProduction: level === 'error' || level === 'warn'
    }
  ) {
    if (!this.shouldLog(level, config)) return

    const logEntry = this.createLogEntry(level, context, message, data)
    
    // Almacenar en memoria
    this.logs.push(logEntry)
    if (this.logs.length > this.maxLogs) {
      this.logs.splice(0, this.logs.length - this.maxLogs)
    }

    // Log en desarrollo
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage(level, context, message)
      
      switch (level) {
        case 'debug':
          console.debug(formattedMessage, data || '')
          break
        case 'info':
          console.info(formattedMessage, data || '')
          break
        case 'warn':
          console.warn(formattedMessage, data || '')
          break
        case 'error':
          console.error(formattedMessage, data || '')
          break
      }
    }

    // Enviar a producción si es necesario
    if (!this.isDevelopment && config.sendToProduction) {
      this.sendToProduction(logEntry)
    }
  }

  private sendToProduction(logEntry: LogEntry) {
    try {
      const productionEntry: ProductionLogEntry = {
        level: logEntry.level,
        context: logEntry.context,
        message: logEntry.message,
        data: logEntry.data,
        metadata: {
          timestamp: logEntry.timestamp.toISOString(),
          userId: logEntry.userId,
          orgId: logEntry.orgId,
          sessionId: logEntry.sessionId,
          url: logEntry.url || '',
          userAgent: logEntry.userAgent || '',
          environment: 'production'
        }
      }

      // Almacenar en localStorage como backup
      const productionLogs = JSON.parse(localStorage.getItem('production_logs') || '[]')
      productionLogs.push(productionEntry)
      
      // Mantener solo los últimos 50 logs de producción
      if (productionLogs.length > 50) {
        productionLogs.splice(0, productionLogs.length - 50)
      }
      
      localStorage.setItem('production_logs', JSON.stringify(productionLogs))

      // TODO: Enviar a servicio de monitoreo (Sentry, LogRocket, etc.)
      
    } catch (error) {
      // Fallo silencioso - no queremos que el logging rompa la app
    }
  }

  private cleanup() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    this.logs = this.logs.filter(log => log.timestamp > oneHourAgo)
  }

  // Métodos públicos para cada contexto
  debug(context: LogContext, message: string, data?: Record<string, unknown>) {
    this.log('debug', context, message, data)
  }

  info(context: LogContext, message: string, data?: Record<string, unknown>) {
    this.log('info', context, message, data)
  }

  warn(context: LogContext, message: string, data?: Record<string, unknown>) {
    this.log('warn', context, message, data)
  }

  error(context: LogContext, message: string, data?: Record<string, unknown>) {
    this.log('error', context, message, data)
  }

  // Métodos utilitarios
  getLogs(context?: LogContext, level?: LogLevel): LogEntry[] {
    return this.logs.filter(log => {
      if (context && log.context !== context) return false
      if (level && log.level !== level) return false
      return true
    })
  }

  clearLogs() {
    this.logs = []
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// Instancia singleton
export const professionalLogger = new ProfessionalLogger()

// Helper para crear loggers con contexto fijo
export const createContextLogger = (context: LogContext) => ({
  debug: (message: string, data?: Record<string, unknown>) =>
    professionalLogger.debug(context, message, data),
  info: (message: string, data?: Record<string, unknown>) =>
    professionalLogger.info(context, message, data),
  warn: (message: string, data?: Record<string, unknown>) =>
    professionalLogger.warn(context, message, data),
  error: (message: string, data?: Record<string, unknown>) =>
    professionalLogger.error(context, message, data)
})