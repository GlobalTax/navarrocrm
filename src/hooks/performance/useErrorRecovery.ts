
import { useCallback, useState } from 'react'
import { useLogger } from '@/hooks/useLogger'
import { toast } from 'sonner'

interface RecoveryOptions {
  maxRetries?: number
  retryDelay?: number
  exponentialBackoff?: boolean
  fallbackAction?: () => void
  onRecovery?: () => void
}

interface RecoveryState {
  retryCount: number
  isRecovering: boolean
  lastError: Error | null
  recoveryStrategy: string | null
}

export const useErrorRecovery = (options: RecoveryOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    fallbackAction,
    onRecovery
  } = options

  const [state, setState] = useState<RecoveryState>({
    retryCount: 0,
    isRecovering: false,
    lastError: null,
    recoveryStrategy: null
  })

  const logger = useLogger('ErrorRecovery')

  const determineRecoveryStrategy = (error: Error): string => {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'network-retry'
    }
    if (error.message.includes('timeout')) {
      return 'timeout-retry'
    }
    if (error.message.includes('session') || error.message.includes('auth')) {
      return 'auth-refresh'
    }
    if (error.message.includes('memory') || error.message.includes('heap')) {
      return 'memory-cleanup'
    }
    return 'generic-retry'
  }

  const executeRecoveryStrategy = async (strategy: string, error: Error): Promise<boolean> => {
    logger.info(`🔄 Executing recovery strategy: ${strategy}`, {
      error: error.message,
      retryCount: state.retryCount
    })

    switch (strategy) {
      case 'network-retry':
        // Wait for network to recover
        await new Promise(resolve => setTimeout(resolve, 2000))
        return navigator.onLine

      case 'timeout-retry':
        // Simple retry with longer timeout
        await new Promise(resolve => setTimeout(resolve, 3000))
        return true

      case 'auth-refresh':
        // Attempt to refresh authentication
        try {
          // This would integrate with your auth system
          await new Promise(resolve => setTimeout(resolve, 1000))
          return true
        } catch {
          return false
        }

      case 'memory-cleanup':
        // Force garbage collection if available
        if ('gc' in window && typeof (window as any).gc === 'function') {
          (window as any).gc()
        }
        
        // Clear caches
        try {
          await caches.keys().then(names => {
            names.forEach(name => caches.delete(name))
          })
        } catch {
          // Ignore cache cleanup errors
        }
        
        return true

      default:
        return true
    }
  }

  const attemptRecovery = useCallback(async (error: Error): Promise<boolean> => {
    if (state.retryCount >= maxRetries) {
      logger.error('🚨 Max retries exceeded', {
        error: error.message,
        retryCount_: state.retryCount,
        maxRetries_: maxRetries
      })
      
      if (fallbackAction) {
        toast.error('Error persistente detectado', {
          description: 'Ejecutando acción de respaldo...',
          action: {
            label: 'Ejecutar',
            onClick: fallbackAction
          }
        })
        fallbackAction()
      }
      
      return false
    }

    const strategy = determineRecoveryStrategy(error)
    const delay = exponentialBackoff 
      ? retryDelay * Math.pow(2, state.retryCount)
      : retryDelay

    setState(prev => ({
      ...prev,
      isRecovering: true,
      lastError: error,
      recoveryStrategy: strategy,
      retryCount: prev.retryCount + 1
    }))

    toast.loading(`Intentando recuperar... (${state.retryCount + 1}/${maxRetries})`, {
      description: `Estrategia: ${strategy}`,
      duration: delay
    })

    try {
      await new Promise(resolve => setTimeout(resolve, delay))
      const success = await executeRecoveryStrategy(strategy, error)
      
      if (success) {
        setState(prev => ({
          ...prev,
          isRecovering: false
        }))
        
        toast.success('Recuperación exitosa', {
          description: `Estrategia ${strategy} funcionó`
        })
        
        if (onRecovery) {
          onRecovery()
        }
        
        logger.info('✅ Recovery successful', {
          strategy,
          retryCount: state.retryCount + 1
        })
        
        return true
      } else {
        // Try next strategy
        return await attemptRecovery(error)
      }
    } catch (recoveryError) {
      logger.error('❌ Recovery failed', {
        strategy,
        originalError: error.message,
        recoveryError: recoveryError instanceof Error ? recoveryError.message : 'Unknown'
      })
      
      setState(prev => ({
        ...prev,
        isRecovering: false
      }))
      
      return false
    }
  }, [state.retryCount, maxRetries, retryDelay, exponentialBackoff, fallbackAction, onRecovery, logger])

  const reset = useCallback(() => {
    setState({
      retryCount: 0,
      isRecovering: false,
      lastError: null,
      recoveryStrategy: null
    })
    logger.info('🔄 Error recovery state reset')
  }, [logger])

  return {
    ...state,
    attemptRecovery,
    reset,
    canRetry: state.retryCount < maxRetries
  }
}
