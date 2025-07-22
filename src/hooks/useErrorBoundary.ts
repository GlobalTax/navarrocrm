import { useState, useCallback } from 'react'
import { useLogger } from './useLogger'

interface ErrorInfo {
  message: string
  stack?: string
  componentStack?: string
  errorBoundary?: boolean
}

interface ErrorRecoveryOptions {
  fallbackComponent?: React.ComponentType<{ error: ErrorInfo; retry: () => void }>
  autoRetry?: boolean
  maxRetries?: number
  retryDelay?: number
}

export const useErrorBoundary = (options: ErrorRecoveryOptions = {}) => {
  const { autoRetry = false, maxRetries = 3, retryDelay = 1000 } = options
  const logger = useLogger('ErrorBoundary')
  
  const [error, setError] = useState<ErrorInfo | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRecovering, setIsRecovering] = useState(false)

  const captureError = useCallback((error: Error, errorInfo?: any) => {
    const errorData: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      errorBoundary: true
    }

    setError(errorData)
    
    logger.error('Error boundary captured error', {
      error: errorData,
      retryCount,
      autoRetry
    })

    // Auto retry logic
    if (autoRetry && retryCount < maxRetries) {
      setIsRecovering(true)
      setTimeout(() => {
        setError(null)
        setRetryCount(prev => prev + 1)
        setIsRecovering(false)
        logger.info('Auto retry attempted', { retryCount: retryCount + 1 })
      }, retryDelay)
    }
  }, [autoRetry, maxRetries, retryCount, retryDelay, logger])

  const resetError = useCallback(() => {
    setError(null)
    setRetryCount(0)
    setIsRecovering(false)
    logger.info('Error boundary reset')
  }, [logger])

  const manualRetry = useCallback(() => {
    if (retryCount < maxRetries) {
      resetError()
      logger.info('Manual retry attempted', { retryCount })
    }
  }, [resetError, retryCount, maxRetries, logger])

  return {
    error,
    retryCount,
    isRecovering,
    captureError,
    resetError,
    manualRetry,
    canRetry: retryCount < maxRetries
  }
}