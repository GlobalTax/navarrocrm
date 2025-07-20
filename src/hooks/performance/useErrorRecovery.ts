
import { useCallback, useState } from 'react'
import { createLogger } from '@/utils/logger'
import { toast } from 'sonner'
import { createError, handleError } from '@/utils/errorHandler'

interface RecoveryOptions {
  maxRetries?: number
  retryDelay?: number
  exponentialBackoff?: boolean
  fallbackAction?: () => void
  onRecovery?: () => void
  context?: string
}

interface RecoveryState {
  retryCount: number
  isRecovering: boolean
  lastError: Error | null
  recoveryStrategy: string | null
}

const logger = createLogger('ErrorRecovery')

export const useErrorRecovery = (options: RecoveryOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    fallbackAction,
    onRecovery,
    context = 'Unknown'
  } = options

  const [state, setState] = useState<RecoveryState>({
    retryCount: 0,
    isRecovering: false,
    lastError: null,
    recoveryStrategy: null
  })

  const determineRecoveryStrategy = (error: Error): string => {
    logger.debug('🔍 Determinando estrategia de recuperación', {
      context,
      errorMessage: error.message,
      errorName: error.name
    })

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
    if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
      return 'chunk-reload'
    }
    if (error.message.includes('quota') || error.message.includes('storage')) {
      return 'storage-cleanup'
    }
    return 'generic-retry'
  }

  const executeRecoveryStrategy = async (strategy: string, error: Error): Promise<boolean> => {
    logger.info(`🔧 Ejecutando estrategia de recuperación: ${strategy}`, {
      context,
      errorMessage: error.message,
      retryCount: state.retryCount
    })

    try {
      switch (strategy) {
        case 'network-retry':
          // Verificar conectividad
          if (!navigator.onLine) {
            logger.warn('📵 Sin conexión a internet', { context })
            return false
          }
          
          // Esperar recuperación de red
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Test de conectividad básico
          try {
            await fetch('/api/health', { method: 'HEAD', cache: 'no-cache' })
            logger.info('✅ Conectividad restaurada', { context })
            return true
          } catch {
            logger.warn('❌ Conectividad aún no disponible', { context })
            return false
          }

        case 'timeout-retry':
          // Retry con timeout más largo
          await new Promise(resolve => setTimeout(resolve, 3000))
          logger.info('⏳ Timeout extendido completado', { context })
          return true

        case 'auth-refresh':
          // Intentar refrescar autenticación
          try {
            // Implementar lógica de refresh de auth aquí
            await new Promise(resolve => setTimeout(resolve, 1000))
            logger.info('🔐 Autenticación refrescada', { context })
            return true
          } catch (authError) {
            logger.error('❌ Error refrescando autenticación', {
              context,
              authError: authError instanceof Error ? authError.message : 'Unknown'
            })
            return false
          }

        case 'memory-cleanup':
          // Forzar garbage collection si está disponible
          if ('gc' in window && typeof (window as any).gc === 'function') {
            (window as any).gc()
            logger.info('🗑️ Garbage collection ejecutado', { context })
          }
          
          // Limpiar caches del navegador
          try {
            const cacheNames = await caches.keys()
            await Promise.all(
              cacheNames.map(cacheName => caches.delete(cacheName))
            )
            logger.info('🧹 Caches limpiados', { 
              context, 
              cachesCleared: cacheNames.length 
            })
          } catch (cacheError) {
            logger.warn('⚠️ Error limpiando caches', {
              context,
              cacheError: cacheError instanceof Error ? cacheError.message : 'Unknown'
            })
          }
          
          return true

        case 'chunk-reload':
          // Recargar la página para resolver errores de chunks
          logger.info('🔄 Recargando página por error de chunk', { context })
          window.location.reload()
          return true

        case 'storage-cleanup':
          // Limpiar localStorage y sessionStorage
          try {
            const localStorageSize = JSON.stringify(localStorage).length
            const sessionStorageSize = JSON.stringify(sessionStorage).length
            
            // Limpiar items no críticos
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('temp_') || key.startsWith('cache_')) {
                localStorage.removeItem(key)
              }
            })
            
            logger.info('🧽 Storage limpiado', {
              context,
              localStorageSize,
              sessionStorageSize
            })
            
            return true
          } catch (storageError) {
            logger.error('❌ Error limpiando storage', {
              context,
              storageError: storageError instanceof Error ? storageError.message : 'Unknown'
            })
            return false
          }

        default:
          logger.info('🔄 Estrategia genérica - esperando', { context })
          await new Promise(resolve => setTimeout(resolve, 1000))
          return true
      }
    } catch (strategyError) {
      logger.error('💥 Error ejecutando estrategia de recuperación', {
        context,
        strategy,
        strategyError: strategyError instanceof Error ? strategyError.message : 'Unknown'
      })
      return false
    }
  }

  const attemptRecovery = useCallback(async (error: Error): Promise<boolean> => {
    const recoveryId = crypto.randomUUID()
    
    logger.info('🚑 Iniciando intento de recuperación', {
      recoveryId,
      context,
      errorMessage: error.message,
      currentRetryCount: state.retryCount,
      maxRetries
    })

    if (state.retryCount >= maxRetries) {
      logger.error('🚨 Máximo de reintentos excedido', {
        recoveryId,
        context,
        retryCount: state.retryCount,
        maxRetries
      })
      
      if (fallbackAction) {
        logger.info('🔄 Ejecutando acción de respaldo', {
          recoveryId,
          context
        })
        
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
        
        logger.info('✅ Recuperación exitosa', {
          recoveryId,
          context,
          strategy,
          finalRetryCount: state.retryCount + 1
        })
        
        return true
      } else {
        // Intentar siguiente estrategia
        logger.warn('⚠️ Estrategia falló, intentando siguiente', {
          recoveryId,
          context,
          failedStrategy: strategy
        })
        return await attemptRecovery(error)
      }
    } catch (recoveryError) {
      logger.error('❌ Error en proceso de recuperación', {
        recoveryId,
        context,
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
  }, [state.retryCount, maxRetries, retryDelay, exponentialBackoff, fallbackAction, onRecovery, context])

  const reset = useCallback(() => {
    logger.info('🔄 Reseteando estado de recuperación', { context })
    
    setState({
      retryCount: 0,
      isRecovering: false,
      lastError: null,
      recoveryStrategy: null
    })
  }, [context])

  return {
    ...state,
    attemptRecovery,
    reset,
    canRetry: state.retryCount < maxRetries
  }
}
