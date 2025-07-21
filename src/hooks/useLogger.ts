
import { useCallback } from 'react'

/**
 * Niveles de logging disponibles en orden de severidad
 * @readonly
 * @enum {string}
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * Contexto de logging con propiedades tipadas para diferentes casos de uso
 * @interface LogContext
 */
interface LogContext {
  // Core properties
  component?: string
  action?: string
  userId?: string
  error?: any
  newState?: any
  
  // Performance metrics
  count?: number
  maxExecutions?: number
  computationTime?: string
  totalComputations?: number
  renderTime?: string
  totalRenders?: number
  
  // Error handling
  path?: string
  stack?: string
  target?: string
  strategy?: string
  value?: number
  originalError?: string
  sessionId?: string
  context?: string
  recoveryError?: string
  componentStack?: string
  
  // Business metrics
  score?: string
  threshold?: number
  pageViews?: number
  totalErrors?: number
  totalInteractions?: number
  
  // Form and validation
  invalidFieldsCount?: number
  retryCount?: number
  duration?: number
  hasMinDuration?: boolean
  retryLimit?: number
  autoRetry?: boolean
  
  // Data operations
  key?: string
  size?: number
  compressed?: boolean
  age?: number
  fetchTime?: string
  
  // Network and connectivity
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
  attempts?: number
  lastOnlineTime?: string
  source?: string
  isSlowConnection?: boolean
  
  // Queue and batch operations
  overflow?: number
  queueSize?: number
  batchSize?: number
  failed?: number
  success?: number
  retryable?: number
  total?: number
  
  // Virtualization and rendering
  itemCount?: number
  visibleItems?: number
  itemHeight?: number
  overscan?: number
  intersectionRatio?: string
  delay?: number
  
  // Cache operations
  cacheKey?: string
  pattern?: string
  searchTerm?: string
  sortBy?: string
  hasNextPage?: boolean
  isLoading?: boolean
  
  // File and asset operations
  url?: string
  loaded?: number
  display?: string
  href?: string
  originalSize?: string
  optimizedSize?: string
  compressionRatio?: string
  format?: string
  dimensions?: string
  processingTime?: string
  file?: string
  successful?: number
  reason?: string
  loadRate?: string
  
  // Additional metadata
  metadata?: Record<string, any>
  type?: string
  entity?: string
  priority?: string
  
  // Permite cualquier propiedad adicional para contexto específico
  [key: string]: any
}

/**
 * Interface para el logger con métodos tipados
 * @interface Logger
 */
interface Logger {
  /** Log de nivel debug - solo en desarrollo */
  debug: (message: string, context?: LogContext) => void
  /** Log de nivel info - información general */
  info: (message: string, context?: LogContext) => void
  /** Log de nivel warning - advertencias no críticas */
  warn: (message: string, context?: LogContext) => void
  /** Log de nivel error - errores críticos */
  error: (message: string, context?: LogContext) => void
}

/**
 * Configuración del entorno de desarrollo
 * @constant {boolean}
 */
const isDevelopment = import.meta.env.DEV

/**
 * Servicio centralizado de logging con manejo de errores y validaciones
 * @class LoggerService
 */
class LoggerService {
  /**
   * Determina si un log debe ser mostrado según el nivel
   * @param {LogLevel} level - Nivel del log
   * @returns {boolean} True si debe mostrarse
   * @private
   */
  private shouldLog(level: LogLevel): boolean {
    // En producción, solo mostrar warns y errors
    if (!isDevelopment && (level === 'debug' || level === 'info')) return false
    return true
  }

  /**
   * Valida que el mensaje no esté vacío
   * @param {string} message - Mensaje a validar
   * @throws {Error} Si el mensaje está vacío
   * @private
   */
  private validateMessage(message: string): void {
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new Error('Log message cannot be empty or non-string')
    }
  }

  /**
   * Valida el contexto del log
   * @param {LogContext} context - Contexto a validar
   * @throws {Error} Si el contexto tiene formato inválido
   * @private
   */
  private validateContext(context?: LogContext): void {
    if (context && typeof context !== 'object') {
      throw new Error('Log context must be an object')
    }
  }

  /**
   * Formatea el mensaje de log con timestamp y contexto
   * @param {LogLevel} level - Nivel del log
   * @param {string} message - Mensaje principal
   * @param {LogContext} context - Contexto adicional
   * @returns {string} Mensaje formateado
   * @private
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? 
      ` [${Object.entries(context)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${k}:${v}`)
        .join(', ')}]` : ''
    
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`
  }

  /**
   * Sanitiza el contexto removiendo propiedades problemáticas
   * @param {LogContext} context - Contexto a sanitizar
   * @returns {LogContext} Contexto sanitizado
   * @private
   */
  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined

    const sanitized: LogContext = {}
    
    for (const [key, value] of Object.entries(context)) {
      try {
        // Evitar referencias circulares en objetos
        if (typeof value === 'object' && value !== null) {
          sanitized[key as keyof LogContext] = JSON.parse(JSON.stringify(value))
        } else {
          sanitized[key as keyof LogContext] = value
        }
      } catch (error) {
        // Si hay error de serialización, convertir a string
        sanitized[key as keyof LogContext] = String(value)
      }
    }

    return sanitized
  }

  /**
   * Ejecuta el logging principal con validaciones y manejo de errores
   * @param {LogLevel} level - Nivel del log
   * @param {string} message - Mensaje a loggear
   * @param {LogContext} context - Contexto adicional
   * @private
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    try {
      // Validaciones de entrada
      this.validateMessage(message)
      this.validateContext(context)

      if (!this.shouldLog(level)) return

      // Sanitizar contexto
      const sanitizedContext = this.sanitizeContext(context)
      const formattedMessage = this.formatMessage(level, message, sanitizedContext)
      
      // Log según nivel
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
        default:
          console.log(formattedMessage)
      }

      // En producción, enviar logs críticos a servicio de monitoreo
      if (!isDevelopment && (level === 'error' || level === 'warn')) {
        this.sendToMonitoring(level, message, sanitizedContext)
      }

    } catch (loggingError) {
      // Fallback silencioso - no queremos que el logging rompa la app
      if (isDevelopment) {
        console.error('Logging error:', loggingError)
      }
    }
  }

  /**
   * Envía logs críticos a servicio de monitoreo en producción
   * @param {LogLevel} level - Nivel del log
   * @param {string} message - Mensaje del log
   * @param {LogContext} context - Contexto del log
   * @private
   */
  private sendToMonitoring(level: LogLevel, message: string, context?: LogContext): void {
    try {
      const logEntry = {
        level,
        message,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        environment: 'production'
      }
      
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]')
      logs.push(logEntry)
      
      // Mantener solo los últimos 100 logs para evitar overflow
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100)
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs))
    } catch (error) {
      // Silently fail - el monitoreo no debe romper la app
    }
  }

  // Métodos públicos del logger
  debug = (message: string, context?: LogContext) => this.log('debug', message, context)
  info = (message: string, context?: LogContext) => this.log('info', message, context)
  warn = (message: string, context?: LogContext) => this.log('warn', message, context)
  error = (message: string, context?: LogContext) => this.log('error', message, context)
}

/**
 * Instancia singleton del servicio de logging
 */
const loggerService = new LoggerService()

/**
 * Hook personalizado para logging con contexto de componente
 * 
 * Proporciona un logger tipado y optimizado para React que incluye:
 * - Validación de parámetros en tiempo de ejecución
 * - Formateo consistente de mensajes
 * - Manejo seguro de errores de logging
 * - Contexto automático del componente
 * - Optimización para desarrollo vs producción
 * 
 * @param {string} componentName - Nombre del componente que usa el logger
 * @returns {Logger} Objeto logger con métodos debug, info, warn, error
 * 
 * @example
 * ```typescript
 * // En un componente
 * const logger = useLogger('UserProfile')
 * 
 * // Logging básico
 * logger.info('Component mounted')
 * 
 * // Con contexto
 * logger.error('Failed to save', { 
 *   userId: user.id, 
 *   error: error.message,
 *   retryCount: 3 
 * })
 * 
 * // En una operación
 * logger.debug('Form validation', {
 *   invalidFieldsCount: errors.length,
 *   action: 'validate'
 * })
 * ```
 * 
 * @example
 * ```typescript
 * // Para operaciones asíncronas
 * const logger = useLogger('DataFetcher')
 * 
 * const fetchData = async () => {
 *   logger.info('Starting data fetch', { url: apiUrl })
 *   
 *   try {
 *     const data = await api.getData()
 *     logger.info('Data fetched successfully', { 
 *       count: data.length,
 *       fetchTime: `${Date.now() - start}ms`
 *     })
 *   } catch (error) {
 *     logger.error('Fetch failed', {
 *       error: error.message,
 *       url: apiUrl,
 *       retryCount: attempt
 *     })
 *   }
 * }
 * ```
 * 
 * @since 1.0.0
 * @version 2.0.0
 */
export function useLogger(componentName?: string): Logger {
  const createLogger = useCallback((level: LogLevel) => {
    return (message: string, context?: LogContext) => {
      try {
        const enhancedContext = {
          component: componentName,
          ...context
        }
        loggerService[level](message, enhancedContext)
      } catch (error) {
        // Fallback para casos donde el logger falla
        if (isDevelopment) {
          console.error(`Logger error in ${componentName}:`, error)
        }
      }
    }
  }, [componentName])

  return {
    debug: createLogger('debug'),
    info: createLogger('info'),
    warn: createLogger('warn'),
    error: createLogger('error')
  }
}

/**
 * Función utilitaria para obtener logs almacenados en localStorage
 * @returns {any[]} Array de logs almacenados
 * 
 * @example
 * ```typescript
 * const logs = getStoredLogs()
 * console.log(`Total logs: ${logs.length}`)
 * ```
 */
export function getStoredLogs(): any[] {
  try {
    return JSON.parse(localStorage.getItem('app_logs') || '[]')
  } catch {
    return []
  }
}

/**
 * Función para limpiar logs almacenados
 * 
 * @example
 * ```typescript
 * // Limpiar logs al logout
 * clearStoredLogs()
 * ```
 */
export function clearStoredLogs(): void {
  try {
    localStorage.removeItem('app_logs')
  } catch {
    // Silently fail
  }
}

/**
 * Función para obtener estadísticas de logs
 * @returns {Object} Estadísticas de logging
 */
export function getLogStats(): { total: number; byLevel: Record<LogLevel, number> } {
  try {
    const logs = getStoredLogs()
    const stats = {
      total: logs.length,
      byLevel: {
        debug: 0,
        info: 0,
        warn: 0,
        error: 0
      } as Record<LogLevel, number>
    }

    logs.forEach(log => {
      if (log.level in stats.byLevel) {
        stats.byLevel[log.level as LogLevel]++
      }
    })

    return stats
  } catch {
    return {
      total: 0,
      byLevel: { debug: 0, info: 0, warn: 0, error: 0 }
    }
  }
}
