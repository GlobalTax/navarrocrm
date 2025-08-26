import { useCallback } from 'react'
import { createContextLogger, type LogContext } from './logger'

/**
 * Hook for using logger in React components
 */
export const useLogger = (context: LogContext) => {
  const contextLogger = useCallback(() => createContextLogger(context), [context])
  
  return contextLogger()
}