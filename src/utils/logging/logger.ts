/**
 * Centralized logging system
 * Replaces all console.log/error/warn calls with structured logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type LogContext = string

export interface LogEntry {
  level: LogLevel
  message: string
  context?: LogContext
  data?: any
  timestamp: Date
  userId?: string
  sessionId?: string
}

class Logger {
  private isDevelopment = import.meta.env.DEV
  private logEntries: LogEntry[] = []
  private maxEntries = 1000

  private log(level: LogLevel, message: string, context?: LogContext, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      context,
      data,
      timestamp: new Date(),
    }

    // Store entry
    this.logEntries.push(entry)
    if (this.logEntries.length > this.maxEntries) {
      this.logEntries.shift()
    }

    // Console output in development
    if (this.isDevelopment) {
      const prefix = context ? `[${context}]` : ''
      const logMessage = `${prefix} ${message}`
      
      switch (level) {
        case 'debug':
          console.log(`🐛 ${logMessage}`, data || '')
          break
        case 'info':
          console.log(`ℹ️ ${logMessage}`, data || '')
          break
        case 'warn':
          console.warn(`⚠️ ${logMessage}`, data || '')
          break
        case 'error':
          console.error(`❌ ${logMessage}`, data || '')
          break
      }
    }

    // In production, could send to external service
    if (!this.isDevelopment && level === 'error') {
      this.sendToErrorService(entry)
    }
  }

  debug(message: string, context?: LogContext, data?: any) {
    this.log('debug', message, context, data)
  }

  info(message: string, context?: LogContext, data?: any) {
    this.log('info', message, context, data)
  }

  warn(message: string, context?: LogContext, data?: any) {
    this.log('warn', message, context, data)
  }

  error(message: string, context?: LogContext, data?: any) {
    this.log('error', message, context, data)
  }

  getRecentLogs(level?: LogLevel): LogEntry[] {
    return level 
      ? this.logEntries.filter(entry => entry.level === level)
      : this.logEntries
  }

  private async sendToErrorService(entry: LogEntry) {
    // Integration point for external error tracking (Sentry, etc.)
    try {
      // Could send to Sentry or other service here
    } catch (err) {
      // Silent fail to avoid logging loops
    }
  }
}

export const logger = new Logger()

// Context-specific loggers
export const createContextLogger = (context: LogContext) => ({
  debug: (message: string, data?: any) => logger.debug(message, context, data),
  info: (message: string, data?: any) => logger.info(message, context, data),
  warn: (message: string, data?: any) => logger.warn(message, context, data),
  error: (message: string, data?: any) => logger.error(message, context, data),
})