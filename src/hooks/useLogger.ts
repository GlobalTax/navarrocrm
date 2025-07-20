import { useCallback } from 'react'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  component?: string
  action?: string
  userId?: string
  error?: any
  newState?: any
  count?: number
  maxExecutions?: number
  computationTime?: string
  totalComputations?: number
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
  score?: string
  threshold?: number
  pageViews?: number
  totalErrors?: number
  totalInteractions?: number
  debugKey?: string
  renderTime?: string
  totalRenders?: number
  // Phase 5: Rendering optimization
  currentCount?: number
  originalCount?: number
  filteredCount?: number
  totalItems?: number
  visibleItems?: number
  itemHeight?: number
  overscan?: number
  intersectionRatio?: string
  delay?: number
  cacheKey?: string
  pattern?: string
  searchTerm?: string
  sortBy?: string
  hasNextPage?: boolean
  isLoading?: boolean
  // Phase 6: Cache and persistence
  key?: string
  size?: number
  compressed?: boolean
  age?: number
  fetchTime?: string
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
  attempts?: number
  lastOnlineTime?: string
  source?: string
  isSlowConnection?: boolean
  overflow?: number
  queueSize?: number
  batchSize?: number
  failed?: number
  success?: number
  retryable?: number
  total?: number
  stored?: string
  current?: string
  type?: string
  entity?: string
  priority?: string
  offlineTime?: number
  // Unique fields
  maxRetries_?: number
  reconnectAttempts_?: number
  accessCount_?: number
  localCacheSize_?: number
  globalCacheSize_?: number
  retryCount_?: number
  depsLength?: number
  recreationCount?: number
  loading?: number
  domContentLoaded?: number
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  cumulativeLayoutShift?: number
  firstInputDelay?: number
  memory?: any
  metadata?: Record<string, any>
  
  // Phase 5 additions
  title?: string
  route?: string
  session?: boolean
  user?: boolean
  authLoading?: boolean
  from?: string
  email?: string
  retryCount?: number
  duration?: number
  hasMinDuration?: boolean
  retryLimit?: number
  invalidFieldsCount?: number
  autoRetry?: boolean
}

interface Logger {
  debug: (message: string, context?: LogContext) => void
  info: (message: string, context?: LogContext) => void
  warn: (message: string, context?: LogContext) => void
  error: (message: string, context?: LogContext) => void
}

const isDevelopment = import.meta.env.DEV

class LoggerService {
  private shouldLog(level: LogLevel): boolean {
    if (!isDevelopment && level === 'debug') return false
    return true
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` [${Object.entries(context).map(([k, v]) => `${k}:${v}`).join(', ')}]` : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (!this.shouldLog(level)) return

    const formattedMessage = this.formatMessage(level, message, context)
    
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

    // En producción, enviar logs críticos a servicio de monitoreo
    if (!isDevelopment && (level === 'error' || level === 'warn')) {
      this.sendToMonitoring(level, message, context)
    }
  }

  private sendToMonitoring(level: LogLevel, message: string, context?: LogContext) {
    // Implementar envío a servicio de monitoreo (Sentry, LogRocket, etc.)
    // Por ahora solo almacenar localmente
    try {
      const logEntry = {
        level,
        message,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
      
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]')
      logs.push(logEntry)
      
      // Mantener solo los últimos 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100)
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs))
    } catch (error) {
      // Silently fail - no queremos que el logging rompa la app
    }
  }

  debug = (message: string, context?: LogContext) => this.log('debug', message, context)
  info = (message: string, context?: LogContext) => this.log('info', message, context)
  warn = (message: string, context?: LogContext) => this.log('warn', message, context)
  error = (message: string, context?: LogContext) => this.log('error', message, context)
}

const loggerService = new LoggerService()

export function useLogger(componentName?: string): Logger {
  const createLogger = useCallback((level: LogLevel) => {
    return (message: string, context?: LogContext) => {
      const enhancedContext = {
        component: componentName,
        ...context
      }
      loggerService[level](message, enhancedContext)
    }
  }, [componentName])

  return {
    debug: createLogger('debug'),
    info: createLogger('info'),
    warn: createLogger('warn'),
    error: createLogger('error')
  }
}

// Función utilitaria para obtener logs almacenados
export function getStoredLogs(): any[] {
  try {
    return JSON.parse(localStorage.getItem('app_logs') || '[]')
  } catch {
    return []
  }
}

// Función para limpiar logs
export function clearStoredLogs(): void {
  localStorage.removeItem('app_logs')
}