
import { useCallback } from 'react'
import { useErrorRecovery } from './useErrorRecovery'
import { useTelemetry } from '@/components/monitoring/TelemetryProvider'
import { useLogger } from '@/hooks/useLogger'

interface SmartErrorBoundaryOptions {
  componentName?: string
  autoRecovery?: boolean
  fallbackAction?: () => void
  customStrategies?: Record<string, () => Promise<boolean>>
}

export const useSmartErrorBoundary = (options: SmartErrorBoundaryOptions = {}) => {
  const { componentName = 'Component', autoRecovery = true, fallbackAction, customStrategies = {} } = options
  
  const { attemptRecovery, ...recoveryState } = useErrorRecovery({
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    fallbackAction,
    onRecovery: () => {
      trackCustomEvent('error_recovery_success', {
        component: componentName,
        strategy: recoveryState.recoveryStrategy
      })
    }
  })
  
  const { trackError, trackCustomEvent } = useTelemetry()
  const logger = useLogger(`ErrorBoundary-${componentName}`)

  const handleError = useCallback(async (error: Error, errorInfo?: any) => {
    // Track the error
    trackError(error, {
      component: componentName,
      errorInfo: errorInfo?.componentStack,
      autoRecovery
    })

    logger.error('Error captured', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack
    })

    // Attempt automatic recovery if enabled
    if (autoRecovery) {
      // Check for custom recovery strategies first
      const errorType = error.constructor.name
      if (customStrategies[errorType]) {
        try {
          const success = await customStrategies[errorType]()
          if (success) {
            trackCustomEvent('custom_recovery_success', {
              component: componentName,
              errorType
            })
            return true
          }
        } catch (recoveryError) {
          logger.error('Custom recovery failed', {
            originalError: error.message,
            recoveryError: recoveryError instanceof Error ? recoveryError.message : 'Unknown'
          })
        }
      }

      // Fall back to standard recovery
      return await attemptRecovery(error)
    }

    return false
  }, [componentName, autoRecovery, customStrategies, attemptRecovery, trackError, trackCustomEvent, logger])

  const withErrorBoundary = useCallback(<T extends any[]>(
    fn: (...args: T) => any,
    context?: string
  ) => {
    return async (...args: T) => {
      try {
        return await fn(...args)
      } catch (error) {
        if (error instanceof Error) {
          await handleError(error, { context })
        }
        throw error
      }
    }
  }, [handleError])

  return {
    ...recoveryState,
    handleError,
    withErrorBoundary,
    componentName
  }
}
