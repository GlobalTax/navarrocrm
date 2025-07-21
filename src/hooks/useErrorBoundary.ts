
import { useState, useCallback } from 'react'
import { useLogger } from './useLogger'

/**
 * Información detallada del error capturado
 * @interface ErrorInfo
 */
interface ErrorInfo {
  /** Mensaje principal del error */
  message: string
  /** Stack trace del error */
  stack?: string
  /** Stack de componentes React donde ocurrió */
  componentStack?: string
  /** Indica si fue capturado por error boundary */
  errorBoundary?: boolean
  /** Timestamp del error */
  timestamp?: string
  /** ID único del error para tracking */
  errorId?: string
  /** Categoría del error para clasificación */
  category?: 'network' | 'runtime' | 'component' | 'validation' | 'unknown'
}

/**
 * Opciones de configuración para recuperación de errores
 * @interface ErrorRecoveryOptions
 */
interface ErrorRecoveryOptions {
  /** Componente fallback personalizado para mostrar durante errores */
  fallbackComponent?: React.ComponentType<{ error: ErrorInfo; retry: () => void }>
  /** Habilitar reintentos automáticos */
  autoRetry?: boolean
  /** Número máximo de reintentos antes de fallar permanentemente */
  maxRetries?: number
  /** Delay en milisegundos entre reintentos */
  retryDelay?: number
  /** Usar backoff exponencial para delays */
  exponentialBackoff?: boolean
  /** Callback ejecutado cuando se recupera exitosamente */
  onRecovery?: (errorInfo: ErrorInfo) => void
  /** Callback ejecutado cuando falla la recuperación */
  onRecoveryFailed?: (errorInfo: ErrorInfo, attempts: number) => void
  /** Estrategias de recuperación personalizadas por tipo de error */
  customRecoveryStrategies?: Record<string, () => Promise<boolean>>
}

/**
 * Hook avanzado para manejo de error boundaries con recuperación automática
 * 
 * Proporciona funcionalidades completas de manejo de errores incluyendo:
 * - Captura automática de errores con información detallada
 * - Reintentos automáticos con backoff exponencial
 * - Categorización de errores para mejor handling
 * - Logging estructurado con contexto completo
 * - Estrategias de recuperación personalizables
 * - Integración con sistemas de monitoreo
 * 
 * @param {ErrorRecoveryOptions} options - Opciones de configuración
 * @returns {Object} Estado y funciones de manejo de errores
 * 
 * @example
 * ```typescript
 * // Uso básico con auto-retry
 * const { error, retryCount, captureError, resetError } = useErrorBoundary({
 *   autoRetry: true,
 *   maxRetries: 3,
 *   retryDelay: 1000
 * })
 * 
 * // En un componente
 * if (error) {
 *   return <ErrorFallback error={error} onRetry={resetError} />
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Con estrategias de recuperación personalizadas
 * const { captureError } = useErrorBoundary({
 *   customRecoveryStrategies: {
 *     NetworkError: async () => {
 *       // Verificar conectividad
 *       const online = await checkConnection()
 *       return online
 *     },
 *     ChunkLoadError: async () => {
 *       // Recargar chunk específico
 *       window.location.reload()
 *       return true
 *     }
 *   },
 *   onRecovery: (errorInfo) => {
 *     analytics.track('error_recovered', { 
 *       category: errorInfo.category,
 *       errorId: errorInfo.errorId 
 *     })
 *   }
 * })
 * ```
 * 
 * @since 1.0.0
 * @version 2.0.0
 */
export const useErrorBoundary = (options: ErrorRecoveryOptions = {}) => {
  // Validación y configuración por defecto
  const {
    autoRetry = false,
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = false,
    onRecovery,
    onRecoveryFailed,
    customRecoveryStrategies = {}
  } = options

  // Validaciones de entrada
  if (typeof maxRetries !== 'number' || maxRetries < 0) {
    throw new Error('maxRetries must be a non-negative number')
  }
  
  if (typeof retryDelay !== 'number' || retryDelay < 0) {
    throw new Error('retryDelay must be a non-negative number')
  }

  const logger = useLogger('ErrorBoundary')
  
  // Estado del error boundary
  const [error, setError] = useState<ErrorInfo | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRecovering, setIsRecovering] = useState(false)
  const [recoveryStrategy, setRecoveryStrategy] = useState<string | null>(null)

  /**
   * Categoriza el error según su tipo y mensaje
   * @param {Error} error - Error a categorizar
   * @returns {ErrorInfo['category']} Categoría del error
   * @private
   */
  const categorizeError = useCallback((error: Error): ErrorInfo['category'] => {
    const message = error.message.toLowerCase()
    const name = error.name.toLowerCase()

    if (name.includes('network') || message.includes('fetch') || message.includes('network')) {
      return 'network'
    }
    
    if (message.includes('chunk') || message.includes('loading')) {
      return 'component'
    }
    
    if (name.includes('type') || name.includes('reference')) {
      return 'runtime'
    }
    
    if (message.includes('validation') || message.includes('required')) {
      return 'validation'
    }

    return 'unknown'
  }, [])

  /**
   * Calcula el delay para el próximo reintento con backoff opcional
   * @param {number} attempt - Número de intento actual
   * @returns {number} Delay en milisegundos
   * @private
   */
  const calculateRetryDelay = useCallback((attempt: number): number => {
    if (!exponentialBackoff) return retryDelay
    
    // Backoff exponencial: 1s, 2s, 4s, 8s...
    return Math.min(retryDelay * Math.pow(2, attempt), 30000) // Max 30 segundos
  }, [retryDelay, exponentialBackoff])

  /**
   * Ejecuta estrategia de recuperación personalizada si existe
   * @param {ErrorInfo} errorInfo - Información del error
   * @returns {Promise<boolean>} True si la recuperación fue exitosa
   * @private
   */
  const executeCustomRecovery = useCallback(async (errorInfo: ErrorInfo): Promise<boolean> => {
    const errorType = errorInfo.category || 'unknown'
    const strategy = customRecoveryStrategies[errorType] || customRecoveryStrategies[errorInfo.message]

    if (!strategy) return false

    try {
      setRecoveryStrategy(errorType)
      
      logger.info('Ejecutando estrategia de recuperación personalizada', {
        strategy: errorType,
        errorId: errorInfo.errorId,
        retryCount
      })

      const success = await strategy()
      
      if (success) {
        logger.info('Recuperación personalizada exitosa', {
          strategy: errorType,
          errorId: errorInfo.errorId
        })
      }

      return success
    } catch (recoveryError) {
      logger.error('Error en estrategia de recuperación personalizada', {
        strategy: errorType,
        errorId: errorInfo.errorId,
        recoveryError: recoveryError instanceof Error ? recoveryError.message : 'Unknown'
      })
      return false
    }
  }, [customRecoveryStrategies, retryCount, logger])

  /**
   * Función principal para capturar y procesar errores
   * @param {Error} error - Error capturado
   * @param {any} errorInfo - Información adicional del error
   */
  const captureError = useCallback(async (error: Error, errorInfo?: any) => {
    const errorId = crypto.randomUUID()
    const category = categorizeError(error)
    
    const structuredError: ErrorInfo = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      errorBoundary: true,
      timestamp: new Date().toISOString(),
      category
    }

    setError(structuredError)
    
    logger.error('Error boundary capturó error', {
      errorId,
      category,
      errorName: error.name,
      errorMessage: error.message,
      retryCount,
      autoRetry,
      componentStack: errorInfo?.componentStack?.slice(0, 200) // Truncar para logs
    })

    // Intentar recuperación automática si está habilitada
    if (autoRetry && retryCount < maxRetries) {
      setIsRecovering(true)
      
      logger.info('Iniciando recuperación automática', {
        errorId,
        retryCount: retryCount + 1,
        maxRetries
      })

      // Intentar estrategia personalizada primero
      const customRecoverySuccess = await executeCustomRecovery(structuredError)
      
      if (customRecoverySuccess) {
        setError(null)
        setRetryCount(0)
        setIsRecovering(false)
        setRecoveryStrategy(null)
        
        if (onRecovery) {
          try {
            onRecovery(structuredError)
          } catch (callbackError) {
            logger.error('Error en callback onRecovery', {
              errorId,
              callbackError: callbackError instanceof Error ? callbackError.message : 'Unknown'
            })
          }
        }
        return
      }

      // Fallback a recuperación estándar con delay
      const delay = calculateRetryDelay(retryCount)
      
      setTimeout(() => {
        setError(null)
        setRetryCount(prev => prev + 1)
        setIsRecovering(false)
        setRecoveryStrategy(null)
        
        logger.info('Reintento automático ejecutado', { 
          errorId,
          retryCount: retryCount + 1,
          delay 
        })

        if (onRecovery) {
          try {
            onRecovery(structuredError)
          } catch (callbackError) {
            logger.error('Error en callback onRecovery', {
              errorId,
              callbackError: callbackError instanceof Error ? callbackError.message : 'Unknown'
            })
          }
        }
      }, delay)
    } else if (retryCount >= maxRetries && onRecoveryFailed) {
      // Ha superado el límite de reintentos
      logger.warn('Límite de reintentos alcanzado', {
        errorId,
        retryCount,
        maxRetries
      })

      try {
        onRecoveryFailed(structuredError, retryCount)
      } catch (callbackError) {
        logger.error('Error en callback onRecoveryFailed', {
          errorId,
          callbackError: callbackError instanceof Error ? callbackError.message : 'Unknown'
        })
      }
    }
  }, [
    autoRetry, 
    maxRetries, 
    retryCount, 
    calculateRetryDelay, 
    executeCustomRecovery, 
    onRecovery, 
    onRecoveryFailed, 
    categorizeError, 
    logger
  ])

  /**
   * Resetea completamente el estado del error boundary
   */
  const resetError = useCallback(() => {
    logger.info('Error boundary reseteado manualmente', {
      hadError: !!error,
      retryCount
    })

    setError(null)
    setRetryCount(0)
    setIsRecovering(false)
    setRecoveryStrategy(null)
  }, [error, retryCount, logger])

  /**
   * Ejecuta un reintento manual si es posible
   */
  const manualRetry = useCallback(() => {
    if (retryCount >= maxRetries) {
      logger.warn('Reintento manual bloqueado - límite alcanzado', {
        retryCount,
        maxRetries
      })
      return false
    }

    logger.info('Reintento manual iniciado', { 
      retryCount: retryCount + 1,
      maxRetries
    })

    setError(null)
    setRetryCount(prev => prev + 1)
    setIsRecovering(false)
    setRecoveryStrategy(null)
    
    return true
  }, [retryCount, maxRetries, logger])

  return {
    /** Error actual o null si no hay errores */
    error,
    /** Número de reintentos realizados */
    retryCount,
    /** Indica si está en proceso de recuperación */
    isRecovering,
    /** Estrategia de recuperación siendo utilizada */
    recoveryStrategy,
    /** Función para capturar errores */
    captureError,
    /** Función para resetear el estado */
    resetError,
    /** Función para reintento manual */
    manualRetry,
    /** Indica si se pueden realizar más reintentos */
    canRetry: retryCount < maxRetries,
    /** Configuración actual */
    config: {
      autoRetry,
      maxRetries,
      retryDelay,
      exponentialBackoff
    }
  }
}
