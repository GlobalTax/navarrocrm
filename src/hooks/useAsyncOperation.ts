import { useState, useCallback } from 'react'
import { AppError, handleError, createError } from '@/utils/errorHandler'

interface RetryOptions {
  maxRetries?: number
  delay?: number
  backoff?: boolean
}

interface UseAsyncOperationResult<T> {
  execute: (operation: () => Promise<T>) => Promise<T | null>
  isLoading: boolean
  error: AppError | null
  retry: () => Promise<T | null>
  clear: () => void
}

export function useAsyncOperation<T>(
  defaultOptions: RetryOptions = {}
): UseAsyncOperationResult<T> {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AppError | null>(null)
  const [lastOperation, setLastOperation] = useState<(() => Promise<T>) | null>(null)

  const executeWithRetry = useCallback(async (
    operation: () => Promise<T>, 
    options: RetryOptions = {}
  ): Promise<T | null> => {
    const {
      maxRetries = defaultOptions.maxRetries || 3,
      delay = defaultOptions.delay || 1000,
      backoff = defaultOptions.backoff || true
    } = options

    setIsLoading(true)
    setError(null)
    setLastOperation(() => operation)

    let lastError: unknown
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation()
        setIsLoading(false)
        return result
      } catch (err) {
        lastError = err
        console.warn(`🔄 [useAsyncOperation] Intento ${attempt + 1}/${maxRetries + 1} falló:`, err)
        
        if (attempt < maxRetries) {
          const waitTime = backoff ? delay * Math.pow(2, attempt) : delay
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    const appError = lastError instanceof AppError 
      ? lastError 
      : createError(
          lastError instanceof Error ? lastError.message : 'Operación falló',
          {
            severity: 'medium',
            retryable: true,
            userMessage: 'La operación falló después de varios intentos'
          }
        )

    setError(appError)
    setIsLoading(false)
    handleError(appError, 'AsyncOperation')
    return null
  }, [defaultOptions])

  const execute = useCallback((operation: () => Promise<T>) => {
    return executeWithRetry(operation)
  }, [executeWithRetry])

  const retry = useCallback(() => {
    if (lastOperation) {
      return executeWithRetry(lastOperation)
    }
    return Promise.resolve(null)
  }, [lastOperation, executeWithRetry])

  const clear = useCallback(() => {
    setError(null)
    setIsLoading(false)
    setLastOperation(null)
  }, [])

  return {
    execute,
    isLoading,
    error,
    retry,
    clear
  }
}