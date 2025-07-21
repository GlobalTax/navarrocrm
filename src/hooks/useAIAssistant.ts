
import { useState, useCallback, useRef, useEffect } from 'react'
import { createLogger } from '@/utils/logger'
import { createError, handleError } from '@/utils/errorHandler'

/**
 * Estados posibles del asistente AI
 */
type AIAssistantState = 'closed' | 'open' | 'minimized' | 'loading' | 'error'

/**
 * Configuración del asistente AI
 */
interface AIAssistantConfig {
  /** Estado inicial del asistente */
  initialState?: AIAssistantState
  /** Habilitar logging detallado */
  enableLogging?: boolean
  /** Máximo número de transiciones de estado por minuto */
  maxTransitionsPerMinute?: number
  /** Callback ejecutado en cambios de estado */
  onStateChange?: (newState: AIAssistantState, previousState: AIAssistantState) => void
  /** Callback ejecutado en errores */
  onError?: (error: Error) => void
}

/**
 * Valor de retorno del hook useAIAssistant
 */
interface AIAssistantReturn {
  /** Indica si el asistente está abierto */
  isOpen: boolean
  /** Indica si el asistente está minimizado */
  isMinimized: boolean
  /** Estado actual del asistente */
  currentState: AIAssistantState
  /** Alternar entre abierto/cerrado */
  toggle: () => void
  /** Minimizar el asistente */
  minimize: () => void
  /** Cerrar el asistente completamente */
  close: () => void
  /** Maximizar/abrir el asistente */
  maximize: () => void
  /** Establecer estado de loading */
  setLoading: (loading: boolean) => void
  /** Establecer estado de error */
  setError: (error?: Error) => void
  /** Resetear a estado inicial */
  reset: () => void
  /** Verificar si puede cambiar de estado */
  canTransition: () => boolean
  /** Obtener historial de estados */
  getStateHistory: () => { state: AIAssistantState; timestamp: number }[]
}

/**
 * Hook para gestionar el estado y comportamiento del asistente AI.
 * Proporciona control completo sobre la visibilidad, estados y transiciones
 * con validación robusta y manejo de errores.
 * 
 * @param config - Configuración opcional del asistente
 * @returns Objeto con estado y funciones de control del asistente
 * 
 * @example
 * ```tsx
 * const {
 *   isOpen,
 *   currentState,
 *   toggle,
 *   minimize,
 *   setLoading,
 *   canTransition
 * } = useAIAssistant({
 *   initialState: 'closed',
 *   maxTransitionsPerMinute: 30,
 *   onStateChange: (newState, oldState) => {
 *     console.log(`AI Assistant: ${oldState} → ${newState}`)
 *   },
 *   onError: (error) => {
 *     toast.error(`Error en asistente: ${error.message}`)
 *   }
 * })
 * 
 * return (
 *   <div>
 *     <Button onClick={toggle} disabled={!canTransition()}>
 *       {isOpen ? 'Cerrar' : 'Abrir'} Asistente
 *     </Button>
 *     {isOpen && (
 *       <AIAssistantPanel 
 *         onMinimize={minimize}
 *         onLoading={(loading) => setLoading(loading)}
 *       />
 *     )}
 *   </div>
 * )
 * ```
 * 
 * @throws {Error} Si la configuración no es válida
 */
export const useAIAssistant = (config: AIAssistantConfig = {}): AIAssistantReturn => {
  const logger = createLogger('useAIAssistant')
  
  // Configuración por defecto
  const defaultConfig: Required<AIAssistantConfig> = {
    initialState: 'closed',
    enableLogging: true,
    maxTransitionsPerMinute: 20,
    onStateChange: () => {},
    onError: () => {}
  }
  
  const normalizedConfig = { ...defaultConfig, ...config }
  
  // Validación de configuración
  useEffect(() => {
    try {
      const validStates: AIAssistantState[] = ['closed', 'open', 'minimized', 'loading', 'error']
      if (!validStates.includes(normalizedConfig.initialState)) {
        throw createError('Invalid initial state', {
          severity: 'medium',
          userMessage: 'Estado inicial del asistente no válido',
          technicalMessage: `initialState must be one of: ${validStates.join(', ')}`
        })
      }

      if (normalizedConfig.maxTransitionsPerMinute < 1 || normalizedConfig.maxTransitionsPerMinute > 100) {
        throw createError('Invalid transition limit', {
          severity: 'low',
          userMessage: 'Límite de transiciones fuera del rango válido',
          technicalMessage: `maxTransitionsPerMinute must be between 1 and 100, received: ${normalizedConfig.maxTransitionsPerMinute}`
        })
      }

      if (typeof normalizedConfig.onStateChange !== 'function') {
        throw createError('Invalid onStateChange callback', {
          severity: 'low',
          userMessage: 'Callback de cambio de estado no válido',
          technicalMessage: 'onStateChange must be a function'
        })
      }

      if (typeof normalizedConfig.onError !== 'function') {
        throw createError('Invalid onError callback', {
          severity: 'low',
          userMessage: 'Callback de error no válido',
          technicalMessage: 'onError must be a function'
        })
      }

      if (normalizedConfig.enableLogging) {
        logger.info('useAIAssistant initialized', {
          metadata: {
            initialState: normalizedConfig.initialState,
            maxTransitionsPerMinute: normalizedConfig.maxTransitionsPerMinute,
            enableLogging: normalizedConfig.enableLogging
          }
        })
      }

    } catch (error) {
      handleError(error, 'useAIAssistant-validation')
      normalizedConfig.onError(error as Error)
    }
  }, [logger, normalizedConfig])

  // Estado interno
  const [currentState, setCurrentState] = useState<AIAssistantState>(normalizedConfig.initialState)
  const [stateHistory, setStateHistory] = useState<{ state: AIAssistantState; timestamp: number }[]>([
    { state: normalizedConfig.initialState, timestamp: Date.now() }
  ])
  
  // Referencias para control de transiciones
  const transitionCountRef = useRef<{ count: number; resetTime: number }>({
    count: 0,
    resetTime: Date.now() + 60000 // Reset cada minuto
  })

  // Estados derivados
  const isOpen = currentState === 'open' || currentState === 'loading'
  const isMinimized = currentState === 'minimized'

  // Función para verificar límites de transición
  const canTransition = useCallback((): boolean => {
    const now = Date.now()
    const transitionData = transitionCountRef.current

    // Reset contador si ha pasado un minuto
    if (now > transitionData.resetTime) {
      transitionData.count = 0
      transitionData.resetTime = now + 60000
    }

    const canTransition = transitionData.count < normalizedConfig.maxTransitionsPerMinute
    
    if (!canTransition && normalizedConfig.enableLogging) {
      logger.warn('Transition limit reached', {
        metadata: {
          currentCount: transitionData.count,
          limit: normalizedConfig.maxTransitionsPerMinute,
          resetTime: new Date(transitionData.resetTime).toISOString()
        }
      })
    }

    return canTransition
  }, [normalizedConfig.maxTransitionsPerMinute, normalizedConfig.enableLogging, logger])

  // Función interna para cambiar estado
  const changeState = useCallback((newState: AIAssistantState, force: boolean = false) => {
    try {
      if (!force && !canTransition()) {
        throw createError('Transition limit exceeded', {
          severity: 'low',
          userMessage: 'Demasiados cambios de estado del asistente. Inténtalo en un momento.',
          technicalMessage: `Exceeded ${normalizedConfig.maxTransitionsPerMinute} transitions per minute`
        })
      }

      if (newState === currentState) {
        if (normalizedConfig.enableLogging) {
          logger.debug('State change ignored (same state)', {
            metadata: { currentState, requestedState: newState }
          })
        }
        return
      }

      const previousState = currentState
      
      // Actualizar estado
      setCurrentState(newState)
      
      // Actualizar historial
      setStateHistory(prev => [...prev.slice(-9), { state: newState, timestamp: Date.now() }])
      
      // Incrementar contador de transiciones
      transitionCountRef.current.count++
      
      // Ejecutar callback
      normalizedConfig.onStateChange(newState, previousState)
      
      if (normalizedConfig.enableLogging) {
        logger.debug('State changed successfully', {
          metadata: {
            previousState,
            newState,
            transitionCount: transitionCountRef.current.count,
            timestamp: new Date().toISOString()
          }
        })
      }

    } catch (error) {
      logger.error('Error changing state', {
        error,
        metadata: {
          currentState,
          requestedState: newState,
          force
        }
      })
      handleError(error, 'useAIAssistant-stateChange')
      normalizedConfig.onError(error as Error)
    }
  }, [currentState, canTransition, normalizedConfig, logger])

  // Funciones públicas de control
  const toggle = useCallback(() => {
    const newState = isOpen ? 'closed' : 'open'
    changeState(newState)
  }, [isOpen, changeState])

  const minimize = useCallback(() => {
    if (currentState === 'open' || currentState === 'loading') {
      changeState('minimized')
    }
  }, [currentState, changeState])

  const close = useCallback(() => {
    changeState('closed')
  }, [changeState])

  const maximize = useCallback(() => {
    if (currentState === 'minimized' || currentState === 'closed') {
      changeState('open')
    }
  }, [currentState, changeState])

  const setLoading = useCallback((loading: boolean) => {
    if (loading && (currentState === 'open' || currentState === 'minimized')) {
      changeState('loading')
    } else if (!loading && currentState === 'loading') {
      changeState('open')
    }
  }, [currentState, changeState])

  const setError = useCallback((error?: Error) => {
    if (error) {
      changeState('error')
      normalizedConfig.onError(error)
      if (normalizedConfig.enableLogging) {
        logger.error('AI Assistant error state set', { error })
      }
    } else if (currentState === 'error') {
      changeState('closed')
    }
  }, [currentState, changeState, normalizedConfig, logger])

  const reset = useCallback(() => {
    changeState(normalizedConfig.initialState, true) // Force reset
    setStateHistory([{ state: normalizedConfig.initialState, timestamp: Date.now() }])
    transitionCountRef.current = { count: 0, resetTime: Date.now() + 60000 }
    
    if (normalizedConfig.enableLogging) {
      logger.info('AI Assistant reset to initial state', {
        metadata: { initialState: normalizedConfig.initialState }
      })
    }
  }, [normalizedConfig.initialState, normalizedConfig.enableLogging, changeState, logger])

  const getStateHistory = useCallback(() => {
    return [...stateHistory]
  }, [stateHistory])

  return {
    isOpen,
    isMinimized,
    currentState,
    toggle,
    minimize,
    close,
    maximize,
    setLoading,
    setError,
    reset,
    canTransition,
    getStateHistory
  }
}

/**
 * Hook especializado para asistente AI en modo desarrollo con logging extendido
 * 
 * @param config - Configuración del asistente
 * @returns Hook configurado para desarrollo
 */
export const useAIAssistantDev = (config: Omit<AIAssistantConfig, 'enableLogging'> = {}) => {
  return useAIAssistant({
    ...config,
    enableLogging: true,
    maxTransitionsPerMinute: 100, // Sin límites en desarrollo
    onStateChange: (newState, previousState) => {
      console.log(`🤖 AI Assistant: ${previousState} → ${newState}`)
      config.onStateChange?.(newState, previousState)
    }
  })
}

/**
 * Hook especializado para asistente AI en modo producción con límites estrictos
 * 
 * @param config - Configuración del asistente
 * @returns Hook configurado para producción
 */
export const useAIAssistantProd = (config: Omit<AIAssistantConfig, 'enableLogging' | 'maxTransitionsPerMinute'> = {}) => {
  return useAIAssistant({
    ...config,
    enableLogging: false,
    maxTransitionsPerMinute: 10, // Límites estrictos en producción
  })
}
