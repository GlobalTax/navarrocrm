import { useState, useCallback, useRef, useEffect } from 'react'
import { useLogger } from './useLogger'

interface LoadingState {
  isLoading: boolean
  error: string | null
  retryCount: number
}

interface LoadingOptions {
  minDuration?: number // Minimum loading duration to prevent flashing
  retryLimit?: number
  debounceMs?: number
}

export const useLoadingOptimization = (
  asyncOperation: () => Promise<any>,
  options: LoadingOptions = {}
) => {
  const { minDuration = 500, retryLimit = 3, debounceMs = 300 } = options
  const logger = useLogger('LoadingOptimization')
  
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    retryCount: 0
  })
  
  const timeoutRef = useRef<NodeJS.Timeout>()
  const startTimeRef = useRef<number>()
  
  const execute = useCallback(async () => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Debounce rapid calls
    return new Promise<void>((resolve) => {
      timeoutRef.current = setTimeout(async () => {
        startTimeRef.current = Date.now()
        
        setState(prev => ({
          ...prev,
          isLoading: true,
          error: null
        }))
        
        try {
          const result = await asyncOperation()
          
          // Ensure minimum loading duration for better UX
          const elapsed = Date.now() - startTimeRef.current!
          const remainingTime = Math.max(0, minDuration - elapsed)
          
          setTimeout(() => {
            setState(prev => ({
              ...prev,
              isLoading: false,
              retryCount: 0
            }))
            resolve()
          }, remainingTime)
          
          logger.debug('Operation completed', { 
            duration: elapsed + remainingTime,
            hasMinDuration: remainingTime > 0 
          })
          
          return result
        } catch (error: any) {
          const elapsed = Date.now() - startTimeRef.current!
          const remainingTime = Math.max(0, minDuration - elapsed)
          
          setTimeout(() => {
            setState(prev => ({
              ...prev,
              isLoading: false,
              error: error.message || 'Error desconocido',
              retryCount: prev.retryCount + 1
            }))
            
            logger.warn('Operation failed', { 
              error: error.message,
              retryCount: state.retryCount + 1,
              duration: elapsed + remainingTime
            })
            
            resolve()
          }, remainingTime)
        }
      }, debounceMs)
    })
  }, [asyncOperation, minDuration, debounceMs, logger])
  
  const retry = useCallback(() => {
    if (state.retryCount < retryLimit) {
      execute()
    } else {
      logger.error('Retry limit exceeded', { retryLimit, retryCount: state.retryCount })
    }
  }, [execute, state.retryCount, retryLimit, logger])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  return {
    ...state,
    execute,
    retry,
    canRetry: state.retryCount < retryLimit
  }
}