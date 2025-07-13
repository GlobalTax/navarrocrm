import { useState, useCallback, useRef, useEffect } from 'react'
import { useLogger } from './useLogger'

interface OptimizedStateOptions<T> {
  debounceMs?: number
  equalityFn?: (a: T, b: T) => boolean
  onStateChange?: (newState: T, prevState: T) => void
  validateState?: (state: T) => boolean
}

export function useOptimizedState<T>(
  initialState: T | (() => T),
  options: OptimizedStateOptions<T> = {}
) {
  const {
    debounceMs = 0,
    equalityFn = (a, b) => a === b,
    onStateChange,
    validateState
  } = options

  const logger = useLogger('useOptimizedState')
  const [state, setState] = useState(initialState)
  const pendingStateRef = useRef<T | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousStateRef = useRef<T>(typeof initialState === 'function' ? (initialState as () => T)() : initialState)

  const setOptimizedState = useCallback((newState: T | ((prev: T) => T)) => {
    const resolvedNewState = typeof newState === 'function' 
      ? (newState as (prev: T) => T)(state)
      : newState

    // Validar estado si se proporciona validador
    if (validateState && !validateState(resolvedNewState)) {
      logger.warn('Invalid state rejected', { newState: resolvedNewState })
      return
    }

    // Verificar si el estado realmente cambió
    if (equalityFn(resolvedNewState, state)) {
      return // No cambió, no hacer nada
    }

    if (debounceMs > 0) {
      // Almacenar el estado pendiente
      pendingStateRef.current = resolvedNewState

      // Limpiar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Configurar nuevo timeout
      timeoutRef.current = setTimeout(() => {
        if (pendingStateRef.current !== null) {
          const prevState = previousStateRef.current
          setState(pendingStateRef.current)
          previousStateRef.current = pendingStateRef.current
          
          if (onStateChange) {
            onStateChange(pendingStateRef.current, prevState)
          }
          
          pendingStateRef.current = null
        }
      }, debounceMs)
    } else {
      // Actualización inmediata
      const prevState = previousStateRef.current
      setState(resolvedNewState)
      previousStateRef.current = resolvedNewState
      
      if (onStateChange) {
        onStateChange(resolvedNewState, prevState)
      }
    }
  }, [state, debounceMs, equalityFn, validateState, onStateChange, logger])

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Forzar actualización inmediata (bypass debounce)
  const forceUpdate = useCallback((newState: T | ((prev: T) => T)) => {
    const resolvedNewState = typeof newState === 'function' 
      ? (newState as (prev: T) => T)(state)
      : newState

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    pendingStateRef.current = null
    const prevState = previousStateRef.current
    setState(resolvedNewState)
    previousStateRef.current = resolvedNewState
    
    if (onStateChange) {
      onStateChange(resolvedNewState, prevState)
    }
  }, [state, onStateChange])

  // Obtener estado pendiente
  const getPendingState = useCallback(() => {
    return pendingStateRef.current
  }, [])

  return [state, setOptimizedState, { forceUpdate, getPendingState }] as const
}