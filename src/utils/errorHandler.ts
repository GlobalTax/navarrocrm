import { toast } from 'sonner'

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

interface ErrorConfig {
  severity: ErrorSeverity
  showToast?: boolean
  retryable?: boolean
  userMessage?: string
  technicalMessage?: string
}

export class AppError extends Error {
  public readonly severity: ErrorSeverity
  public readonly retryable: boolean
  public readonly userMessage: string
  public readonly technicalMessage: string
  public readonly timestamp: Date

  constructor(message: string, config: ErrorConfig) {
    super(message)
    this.name = 'AppError'
    this.severity = config.severity
    this.retryable = config.retryable || false
    this.userMessage = config.userMessage || 'Ha ocurrido un error inesperado'
    this.technicalMessage = config.technicalMessage || message
    this.timestamp = new Date()
  }
}

export const createError = (message: string, config: ErrorConfig): AppError => {
  return new AppError(message, config)
}

export const handleError = (error: unknown, context?: string): void => {
  console.error(`🚨 [ErrorHandler${context ? ` - ${context}` : ''}]`, error)

  if (error instanceof AppError) {
    if (error.severity === 'critical') {
      toast.error(error.userMessage, {
        description: 'Error crítico del sistema',
        duration: 10000,
        action: error.retryable ? {
          label: 'Reintentar',
          onClick: () => window.location.reload()
        } : undefined
      })
    } else if (error.severity === 'high') {
      toast.error(error.userMessage, {
        description: 'Se requiere atención',
        duration: 6000,
      })
    } else if (error.severity === 'medium') {
      toast.warning(error.userMessage, {
        duration: 4000,
      })
    } else {
      toast.info(error.userMessage, {
        duration: 3000,
      })
    }
  } else if (error instanceof Error) {
    toast.error('Error inesperado', {
      description: error.message,
      duration: 5000,
    })
  } else {
    toast.error('Error desconocido', {
      description: 'Ha ocurrido un error que no se pudo identificar',
      duration: 5000,
    })
  }
}

export const showSuccessToast = (message: string, description?: string): void => {
  toast.success(message, {
    description,
    duration: 3000,
  })
}

export const showInfoToast = (message: string, description?: string): void => {
  toast.info(message, {
    description,
    duration: 4000,
  })
}

export const showLoadingToast = (message: string, promise: Promise<any>): void => {
  toast.promise(promise, {
    loading: message,
    success: 'Operación completada',
    error: 'Error en la operación',
  })
}