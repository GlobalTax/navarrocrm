/**
 * Production-ready logger that replaces all console.* calls
 * Provides structured logging with levels, context, and filtering
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  component?: string
  module?: string
  action?: string
  userId?: string
  orgId?: string
  error?: any
  metadata?: Record<string, any>
  // Allow any additional context properties
  [key: string]: any
}

interface LogEntry {
  level: LogLevel
  message: string
  context?: LogContext
  timestamp: string
  sessionId: string
  url: string
  userAgent: string
}

class ProductionLogger {
  private isDevelopment = import.meta.env.DEV
  private sessionId = crypto.randomUUID()
  private maxStoredLogs = 100

  private shouldLog(level: LogLevel): boolean {
    // In production, skip debug logs
    if (!this.isDevelopment && level === 'debug') return false
    return true
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const prefix = context?.component ? `[${context.component}]` : ''
    const contextStr = context ? this.formatContext(context) : ''
    
    return `${timestamp} ${level.toUpperCase()} ${prefix} ${message}${contextStr}`
  }

  private formatContext(context: LogContext): string {
    const filteredContext = Object.entries(context)
      .filter(([key, value]) => key !== 'component' && value !== undefined)
      .map(([key, value]) => `${key}:${typeof value === 'object' ? JSON.stringify(value) : value}`)
      .join(', ')
    
    return filteredContext ? ` {${filteredContext}}` : ''
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (!this.shouldLog(level)) return

    const formattedMessage = this.formatMessage(level, message, context)
    
    // Console output with appropriate method
    switch (level) {
      case 'debug':
        console.debug(formattedMessage)
        break
      case 'info':
        console.info(formattedMessage)
        break
      case 'warn':
        console.warn(formattedMessage)
        break
      case 'error':
        console.error(formattedMessage)
        break
    }

    // Store critical logs in production
    if (!this.isDevelopment && (level === 'error' || level === 'warn')) {
      this.storeLog(level, message, context)
    }
  }

  private storeLog(level: LogLevel, message: string, context?: LogContext) {
    try {
      const logEntry: LogEntry = {
        level,
        message,
        context,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        url: window.location.href,
        userAgent: navigator.userAgent
      }
      
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]')
      logs.push(logEntry)
      
      // Keep only the latest logs
      if (logs.length > this.maxStoredLogs) {
        logs.splice(0, logs.length - this.maxStoredLogs)
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs))
    } catch (error) {
      // Silently fail - don't break the app for logging issues
    }
  }

  debug = (message: string, context?: LogContext) => this.log('debug', message, context)
  info = (message: string, context?: LogContext) => this.log('info', message, context)
  warn = (message: string, context?: LogContext) => this.log('warn', message, context)
  error = (message: string, context?: LogContext) => this.log('error', message, context)

  // Utility methods
  getStoredLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('app_logs') || '[]')
    } catch {
      return []
    }
  }

  clearStoredLogs(): void {
    localStorage.removeItem('app_logs')
  }

  // Create context-specific loggers
  createContextLogger(component: string) {
    return {
      debug: (message: string, additionalContext?: LogContext) => 
        this.debug(message, { component, ...additionalContext }),
      info: (message: string, additionalContext?: LogContext) => 
        this.info(message, { component, ...additionalContext }),
      warn: (message: string, additionalContext?: LogContext) => 
        this.warn(message, { component, ...additionalContext }),
      error: (message: string, additionalContext?: LogContext) => 
        this.error(message, { component, ...additionalContext })
    }
  }
}

// Global instance
export const logger = new ProductionLogger()

// Create context-specific loggers
export const createLogger = (component: string) => logger.createContextLogger(component)
