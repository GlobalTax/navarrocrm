
/**
 * Sistema de logging centralizado y optimizado
 * Solo funciona en desarrollo - en producción es completamente silencioso
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogConfig {
  level: LogLevel
  enabled: boolean
  context?: string
}

class Logger {
  private config: LogConfig

  constructor(context?: string) {
    this.config = {
      level: 'info',
      enabled: import.meta.env.DEV,
      context
    }
  }

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (!this.config.enabled) return

    const prefix = this.config.context ? `[${this.config.context}]` : ''
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    
    switch (level) {
      case 'debug':
        console.debug(`🔍 ${timestamp} ${prefix}`, message, ...args)
        break
      case 'info':
        console.info(`ℹ️ ${timestamp} ${prefix}`, message, ...args)
        break
      case 'warn':
        console.warn(`⚠️ ${timestamp} ${prefix}`, message, ...args)
        break
      case 'error':
        console.error(`❌ ${timestamp} ${prefix}`, message, ...args)
        break
    }
  }

  debug = (message: string, ...args: any[]) => this.log('debug', message, ...args)
  info = (message: string, ...args: any[]) => this.log('info', message, ...args)
  warn = (message: string, ...args: any[]) => this.log('warn', message, ...args)
  error = (message: string, ...args: any[]) => this.log('error', message, ...args)
}

// Factory function para crear loggers
export const createLogger = (context?: string) => new Logger(context)

// Logger global para casos donde no se puede usar el context
export const logger = createLogger('Global')

// Loggers específicos para módulos críticos
export const authLogger = createLogger('Auth')
export const appLogger = createLogger('App')
export const routeLogger = createLogger('Route')
