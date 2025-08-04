/**
 * Sistema de logging optimizado para producción
 * Elimina overhead de console.log en producción
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface Logger {
  debug: (message: string, data?: any) => void
  info: (message: string, data?: any) => void
  warn: (message: string, data?: any) => void
  error: (message: string, data?: any) => void
}

const isDevelopment = import.meta.env.DEV

class ProductionLogger implements Logger {
  private shouldLog(level: LogLevel): boolean {
    // En producción solo loggear errores críticos
    if (!isDevelopment) {
      return level === 'error'
    }
    
    // Filtrar errores de extensiones del navegador
    if (typeof window !== 'undefined') {
      const stack = new Error().stack
      if (stack && (stack.includes('SyncoRedux') || stack.includes('classifier.js') || stack.includes('content.js'))) {
        return false
      }
    }
    
    return true
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8)
    const dataStr = data ? ` ${JSON.stringify(data)}` : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${dataStr}`
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data))
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data))
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data))
    }
  }

  error(message: string, data?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, data))
    }
  }
}

// Logger principal
export const logger = new ProductionLogger()

// Factory para crear loggers con contexto
export const createLogger = (context: string): Logger => ({
  debug: (message: string, data?: any) => logger.debug(`[${context}] ${message}`, data),
  info: (message: string, data?: any) => logger.info(`[${context}] ${message}`, data),
  warn: (message: string, data?: any) => logger.warn(`[${context}] ${message}`, data),
  error: (message: string, data?: any) => logger.error(`[${context}] ${message}`, data),
})