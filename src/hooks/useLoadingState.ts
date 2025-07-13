import { useState, useCallback, useRef } from 'react'
import { useLogger } from './useLogger'

interface LoadingState {
  [key: string]: boolean
}

interface UseLoadingStateResult {
  isLoading: (key?: string) => boolean
  setLoading: (key: string, loading: boolean) => void
  startLoading: (key: string) => void
  stopLoading: (key: string) => void
  stopAllLoading: () => void
  getLoadingKeys: () => string[]
}

export function useLoadingState(componentName?: string): UseLoadingStateResult {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({})
  const logger = useLogger(componentName)
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({})

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => {
      const newState = { ...prev }
      
      if (loading) {
        newState[key] = true
        logger.debug(`Loading started: ${key}`)
        
        // Timeout de seguridad para evitar loading infinito
        timeoutRefs.current[key] = setTimeout(() => {
          logger.warn(`Loading timeout reached for: ${key}`)
          setLoadingStates(current => {
            const updated = { ...current }
            delete updated[key]
            return updated
          })
        }, 30000) // 30 segundos máximo
      } else {
        delete newState[key]
        logger.debug(`Loading finished: ${key}`)
        
        // Limpiar timeout
        if (timeoutRefs.current[key]) {
          clearTimeout(timeoutRefs.current[key])
          delete timeoutRefs.current[key]
        }
      }
      
      return newState
    })
  }, [logger])

  const startLoading = useCallback((key: string) => {
    setLoading(key, true)
  }, [setLoading])

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false)
  }, [setLoading])

  const stopAllLoading = useCallback(() => {
    logger.info('Stopping all loading states')
    
    // Limpiar todos los timeouts
    Object.values(timeoutRefs.current).forEach(timeout => {
      clearTimeout(timeout)
    })
    timeoutRefs.current = {}
    
    setLoadingStates({})
  }, [logger])

  const isLoading = useCallback((key?: string) => {
    if (key) {
      return Boolean(loadingStates[key])
    }
    return Object.keys(loadingStates).length > 0
  }, [loadingStates])

  const getLoadingKeys = useCallback(() => {
    return Object.keys(loadingStates)
  }, [loadingStates])

  return {
    isLoading,
    setLoading,
    startLoading,
    stopLoading,
    stopAllLoading,
    getLoadingKeys
  }
}