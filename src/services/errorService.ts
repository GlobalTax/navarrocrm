
import { ErrorInfo } from 'react'

interface ErrorReport {
  message: string
  stack?: string
  componentStack?: string
  timestamp: string
  userAgent: string
  url: string
  userId?: string
  orgId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  context?: Record<string, any>
}

class ErrorService {
  private isDevelopment = import.meta.env.DEV
  
  // Configuración para servicios externos (Sentry, LogRocket, etc.)
  private config = {
    enableExternalLogging: false,
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    maxErrorsPerSession: 50,
    enableConsoleLogging: true
  }

  private errorCount = 0

  logError(error: Error, errorInfo?: ErrorInfo, context?: Record<string, any>) {
    // Prevenir spam de errores
    if (this.errorCount >= this.config.maxErrorsPerSession) {
      return
    }
    
    this.errorCount++

    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      severity: this.determineSeverity(error),
      context
    }

    // Log a consola en desarrollo
    if (this.isDevelopment && this.config.enableConsoleLogging) {
      console.group('🚨 Error Report')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.table(errorReport)
      console.groupEnd()
    }

    // Enviar a servicios externos en producción
    if (!this.isDevelopment && this.config.enableExternalLogging) {
      this.sendToExternalService(errorReport)
    }

    // Guardar en localStorage para debugging local
    this.saveToLocalStorage(errorReport)
  }

  private determineSeverity(error: Error): ErrorReport['severity'] {
    const message = error.message.toLowerCase()
    
    if (message.includes('chunk') || message.includes('loading')) {
      return 'low'
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'medium'
    }
    
    if (message.includes('auth') || message.includes('permission')) {
      return 'high'
    }
    
    return 'critical'
  }

  private async sendToExternalService(errorReport: ErrorReport) {
    try {
      // Aquí integrarías con Sentry, LogRocket, etc.
      // Por ejemplo, con Sentry:
      // Sentry.captureException(new Error(errorReport.message), {
      //   extra: errorReport,
      //   level: errorReport.severity
      // })
      
      console.log('Would send to external service:', errorReport)
    } catch (serviceError) {
      console.warn('Failed to send error to external service:', serviceError)
    }
  }

  private saveToLocalStorage(errorReport: ErrorReport) {
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app-errors') || '[]')
      const maxStoredErrors = 20
      
      existingErrors.push(errorReport)
      
      // Mantener solo los últimos N errores
      if (existingErrors.length > maxStoredErrors) {
        existingErrors.splice(0, existingErrors.length - maxStoredErrors)
      }
      
      localStorage.setItem('app-errors', JSON.stringify(existingErrors))
    } catch (storageError) {
      console.warn('Failed to save error to localStorage:', storageError)
    }
  }

  // Métodos utilitarios
  getStoredErrors(): ErrorReport[] {
    try {
      return JSON.parse(localStorage.getItem('app-errors') || '[]')
    } catch {
      return []
    }
  }

  clearStoredErrors() {
    localStorage.removeItem('app-errors')
    this.errorCount = 0
  }

  // Configurar servicios externos
  configure(newConfig: Partial<typeof this.config>) {
    this.config = { ...this.config, ...newConfig }
  }
}

export const errorService = new ErrorService()

// Hook para usar el servicio de errores
export const useErrorService = () => {
  const reportError = (error: Error, errorInfo?: ErrorInfo, context?: Record<string, any>) => {
    errorService.logError(error, errorInfo, context)
  }

  return {
    reportError,
    getStoredErrors: errorService.getStoredErrors.bind(errorService),
    clearStoredErrors: errorService.clearStoredErrors.bind(errorService)
  }
}
