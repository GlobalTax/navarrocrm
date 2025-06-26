
import { useCallback, useRef, useEffect } from 'react'
import { useOptimizedAPICache } from '@/hooks/cache/useOptimizedAPICache'
import { useGlobalStateContext } from '@/contexts/GlobalStateContext'

interface RecoveryOptions {
  maxRetries?: number
  retryDelay?: number
  enableCacheFallback?: boolean
  enableOfflineMode?: boolean
}

interface RecoveryState {
  isRecovering: boolean
  retryCount: number
  lastError: Error | null
  recoveryMethod: string | null
}

export const useAutoRecovery = (options: RecoveryOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    enableCacheFallback = true,
    enableOfflineMode = true
  } = options

  const apiCache = useOptimizedAPICache()
  const { addNotification } = useGlobalStateContext()
  
  const recoveryStateRef = useRef<RecoveryState>({
    isRecovering: false,
    retryCount: 0,
    lastError: null,
    recoveryMethod: null
  })

  // Detectar si el error es recuperable automáticamente
  const isRecoverableError = useCallback((error: Error): boolean => {
    const message = error.message.toLowerCase()
    
    // Errores de red temporales
    if (message.includes('fetch') || message.includes('network')) return true
    if (message.includes('timeout') || message.includes('connection')) return true
    if (message.includes('502') || message.includes('503') || message.includes('504')) return true
    
    // Errores de cache
    if (message.includes('cache') || message.includes('storage')) return true
    
    return false
  }, [])

  // Determinar el método de recuperación más apropiado
  const getRecoveryMethod = useCallback((error: Error): string => {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'network-retry'
    }
    
    if (message.includes('cache') || message.includes('storage')) {
      return 'cache-rebuild'
    }
    
    if (message.includes('timeout')) {
      return 'timeout-retry'
    }
    
    return 'generic-retry'
  }, [])

  // Función principal de auto-recuperación
  const attemptAutoRecovery = useCallback(async <T>(
    operation: () => Promise<T>,
    error: Error,
    context?: { 
      cacheKey?: string
      fallbackData?: T 
      operationName?: string
    }
  ): Promise<T | null> => {
    const state = recoveryStateRef.current

    // Verificar si el error es recuperable
    if (!isRecoverableError(error)) {
      console.log('🚫 Error no recuperable automáticamente:', error.message)
      return null
    }

    // Verificar límite de reintentos
    if (state.retryCount >= maxRetries) {
      console.log('❌ Límite de reintentos alcanzado')
      addNotification({
        type: 'error',
        title: 'Error Persistente',
        message: 'No se pudo recuperar automáticamente. Contacta al soporte.',
        autoClose: false
      })
      return null
    }

    state.isRecovering = true
    state.retryCount++
    state.lastError = error
    state.recoveryMethod = getRecoveryMethod(error)

    console.log(`🔄 Intento de recuperación automática ${state.retryCount}/${maxRetries}`)
    console.log(`📋 Método: ${state.recoveryMethod}`)

    try {
      // Notificar usuario del intento de recuperación
      addNotification({
        type: 'info',
        title: 'Recuperación Automática',
        message: `Reintentando operación... (${state.retryCount}/${maxRetries})`,
        autoClose: true,
        duration: 2000
      })

      // Aplicar estrategia de recuperación específica
      switch (state.recoveryMethod) {
        case 'network-retry':
          // Esperar antes de reintentar
          await new Promise(resolve => setTimeout(resolve, retryDelay * state.retryCount))
          break
          
        case 'cache-rebuild':
          // Intentar limpiar cache corrupto
          if (context?.cacheKey && apiCache.isReady) {
            await apiCache.invalidateKey(context.cacheKey)
          }
          break
          
        case 'timeout-retry':
          // Aumentar timeout para el siguiente intento
          await new Promise(resolve => setTimeout(resolve, retryDelay * 2))
          break
      }

      // Intentar ejecutar la operación nuevamente
      const result = await operation()
      
      // Recuperación exitosa
      state.isRecovering = false
      state.retryCount = 0
      state.lastError = null
      state.recoveryMethod = null

      console.log('✅ Recuperación automática exitosa')
      addNotification({
        type: 'success',
        title: 'Recuperación Exitosa',
        message: `${context?.operationName || 'Operación'} completada correctamente`,
        autoClose: true,
        duration: 3000
      })

      return result

    } catch (retryError) {
      console.log(`❌ Intento ${state.retryCount} falló:`, retryError)
      
      // Si alcanzamos el límite, intentar fallback
      if (state.retryCount >= maxRetries) {
        return await attemptFallbackRecovery(context)
      }
      
      // Continuar con más intentos
      return await attemptAutoRecovery(operation, retryError as Error, context)
    }
  }, [isRecoverableError, getRecoveryMethod, maxRetries, retryDelay, addNotification, apiCache])

  // Función de recuperación con fallbacks
  const attemptFallbackRecovery = useCallback(async <T>(
    context?: { 
      cacheKey?: string
      fallbackData?: T 
      operationName?: string
    }
  ): Promise<T | null> => {
    console.log('🔄 Intentando recuperación con fallback')

    // Intentar obtener datos del cache como fallback
    if (enableCacheFallback && context?.cacheKey && apiCache.isReady) {
      try {
        const cachedData = await apiCache.fetchWithCache(
          context.cacheKey,
          async () => {
            throw new Error('No fresh data available')
          },
          { forceRefresh: false }
        )
        
        if (cachedData) {
          console.log('✅ Datos recuperados del cache')
          addNotification({
            type: 'info',
            title: 'Modo Fallback',
            message: 'Mostrando datos almacenados. Funcionalidad limitada.',
            autoClose: true,
            duration: 4000
          })
          return cachedData
        }
      } catch (cacheError) {
        console.log('❌ Cache fallback también falló:', cacheError)
      }
    }

    // Usar datos de fallback proporcionados
    if (context?.fallbackData) {
      console.log('✅ Usando datos de fallback')
      addNotification({
        type: 'warning',
        title: 'Datos Limitados',
        message: 'Mostrando información básica. Intenta recargar más tarde.',
        autoClose: true,
        duration: 4000
      })
      return context.fallbackData
    }

    // Modo offline si está habilitado
    if (enableOfflineMode && !navigator.onLine) {
      addNotification({
        type: 'warning',
        title: 'Modo Offline',
        message: 'Sin conexión. Funcionalidad limitada disponible.',
        autoClose: false
      })
    }

    return null
  }, [enableCacheFallback, enableOfflineMode, apiCache, addNotification])

  // Limpiar estado al desmontar
  useEffect(() => {
    return () => {
      recoveryStateRef.current = {
        isRecovering: false,
        retryCount: 0,
        lastError: null,
        recoveryMethod: null
      }
    }
  }, [])

  // Función wrapper para usar con operaciones
  const withAutoRecovery = useCallback(<T>(
    operation: () => Promise<T>,
    context?: { 
      cacheKey?: string
      fallbackData?: T 
      operationName?: string
    }
  ) => {
    return async (): Promise<T> => {
      try {
        return await operation()
      } catch (error) {
        console.log('🔄 Error detectado, iniciando auto-recuperación:', error)
        
        const recoveredResult = await attemptAutoRecovery(
          operation, 
          error as Error, 
          context
        )
        
        if (recoveredResult !== null) {
          return recoveredResult
        }
        
        // Si la recuperación falló, relanzar el error original
        throw error
      }
    }
  }, [attemptAutoRecovery])

  return {
    withAutoRecovery,
    attemptAutoRecovery,
    isRecovering: recoveryStateRef.current.isRecovering,
    retryCount: recoveryStateRef.current.retryCount,
    lastError: recoveryStateRef.current.lastError
  }
}
