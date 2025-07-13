import { useEffect, useRef, useCallback } from 'react'
import { useLogger } from './useLogger'

interface OptimizedEffectOptions {
  debounceMs?: number
  maxExecutions?: number
  resetCountAfterMs?: number
  onMaxExecutionsReached?: () => void
}

export function useOptimizedEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList,
  options: OptimizedEffectOptions = {}
) {
  const {
    debounceMs = 0,
    maxExecutions = Infinity,
    resetCountAfterMs = 60000, // Reset después de 1 minuto
    onMaxExecutionsReached
  } = options

  const logger = useLogger('useOptimizedEffect')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const executionCountRef = useRef(0)
  const lastResetRef = useRef(Date.now())
  const cleanupRef = useRef<(() => void) | void>()

  const executeEffect = useCallback(() => {
    const now = Date.now()
    
    // Reset contador si ha pasado el tiempo especificado
    if (now - lastResetRef.current > resetCountAfterMs) {
      executionCountRef.current = 0
      lastResetRef.current = now
    }

    // Verificar límite de ejecuciones
    if (executionCountRef.current >= maxExecutions) {
      logger.warn('Max executions reached for effect', { 
        count: executionCountRef.current,
        maxExecutions 
      })
      onMaxExecutionsReached?.()
      return
    }

    executionCountRef.current++
    
    try {
      // Limpiar efecto anterior si existe
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = undefined
      }
      
      // Ejecutar nuevo efecto
      cleanupRef.current = effect()
    } catch (error) {
      logger.error('Effect execution failed', { error })
    }
  }, [effect, maxExecutions, resetCountAfterMs, onMaxExecutionsReached, logger])

  useEffect(() => {
    if (debounceMs > 0) {
      // Limpiar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Configurar nuevo timeout
      timeoutRef.current = setTimeout(executeEffect, debounceMs)

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    } else {
      // Ejecución inmediata
      executeEffect()
      
      return () => {
        if (cleanupRef.current) {
          cleanupRef.current()
          cleanupRef.current = undefined
        }
      }
    }
  }, deps)

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])
}

// Hook para efectos que solo deben ejecutarse una vez
export function useOnceEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList
) {
  return useOptimizedEffect(effect, deps, { maxExecutions: 1 })
}

// Hook para efectos con debounce automático
export function useDebouncedEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList,
  debounceMs: number = 300
) {
  return useOptimizedEffect(effect, deps, { debounceMs })
}