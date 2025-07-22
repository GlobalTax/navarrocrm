
import { useEffect, useRef, useCallback } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface MemoryOptions {
  maxMemoryMB?: number
  cleanupThreshold?: number
  checkInterval?: number
}

interface MemoryMetrics {
  used: number
  total: number
  percentage: number
  timestamp: number
}

export const useDocumentMemory = (options: MemoryOptions = {}) => {
  const {
    maxMemoryMB = 100,
    cleanupThreshold = 80,
    checkInterval = 10000
  } = options

  const logger = useLogger('DocumentMemory')
  const memoryTracking = useRef<Map<string, number>>(new Map())
  const intervalRef = useRef<NodeJS.Timeout>()

  // Obtener métricas de memoria
  const getMemoryMetrics = useCallback((): MemoryMetrics | null => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        timestamp: Date.now()
      }
    }
    return null
  }, [])

  // Trackear uso de memoria por operación
  const trackMemoryUsage = useCallback((operation: string) => {
    const metrics = getMemoryMetrics()
    if (metrics) {
      memoryTracking.current.set(operation, metrics.used)
      
      const memoryMB = metrics.used / 1024 / 1024
      if (memoryMB > maxMemoryMB * 0.9) {
        logger.warn('🚨 Alto uso de memoria detectado', {
          operation,
          memoryMB: memoryMB.toFixed(1),
          maxMemoryMB,
          percentage: metrics.percentage.toFixed(1)
        })
      }
    }
  }, [getMemoryMetrics, maxMemoryMB, logger])

  // Forzar garbage collection si está disponible
  const forceGarbageCollection = useCallback(() => {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      try {
        (window as any).gc()
        logger.info('🗑️ Garbage collection forzado')
      } catch (error) {
        logger.warn('No se pudo forzar garbage collection:', error)
      }
    }
  }, [logger])

  // Limpiar referencias y memoria
  const cleanup = useCallback(() => {
    // Limpiar referencias de tracking
    memoryTracking.current.clear()
    
    // Forzar GC si es posible
    forceGarbageCollection()
    
    logger.info('🧹 Limpieza de memoria completada')
  }, [forceGarbageCollection, logger])

  // Monitoreo automático de memoria
  const startMemoryMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      const metrics = getMemoryMetrics()
      if (metrics) {
        const memoryMB = metrics.used / 1024 / 1024
        
        if (metrics.percentage > cleanupThreshold) {
          logger.warn('🚨 Umbral de memoria excedido, iniciando limpieza', {
            percentage: metrics.percentage.toFixed(1),
            memoryMB: memoryMB.toFixed(1),
            threshold: cleanupThreshold
          })
          
          // Limpiar automáticamente
          cleanup()
        }

        // Log periódico del estado de memoria
        logger.debug('📊 Estado de memoria', {
          memoryMB: memoryMB.toFixed(1),
          percentage: metrics.percentage.toFixed(1),
          operations: memoryTracking.current.size
        })
      }
    }, checkInterval)
  }, [getMemoryMetrics, cleanupThreshold, cleanup, checkInterval, logger])

  // Obtener métricas detalladas
  const getDetailedMetrics = useCallback(() => {
    const current = getMemoryMetrics()
    const operations = Array.from(memoryTracking.current.entries()).map(([operation, memory]) => ({
      operation,
      memoryMB: (memory / 1024 / 1024).toFixed(1)
    }))

    return {
      current,
      operations,
      summary: {
        totalOperations: operations.length,
        maxMemoryMB,
        cleanupThreshold
      }
    }
  }, [getMemoryMetrics, maxMemoryMB, cleanupThreshold])

  // Detectar memory leaks potenciales
  const checkForMemoryLeaks = useCallback(() => {
    const metrics = getMemoryMetrics()
    if (!metrics) return false

    const memoryMB = metrics.used / 1024 / 1024
    const isLeak = memoryMB > maxMemoryMB && metrics.percentage > 90

    if (isLeak) {
      logger.error('💥 Posible memory leak detectado', {
        memoryMB: memoryMB.toFixed(1),
        percentage: metrics.percentage.toFixed(1),
        operationsTracked: memoryTracking.current.size
      })
    }

    return isLeak
  }, [getMemoryMetrics, maxMemoryMB, logger])

  // Iniciar monitoreo al montar
  useEffect(() => {
    startMemoryMonitoring()
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [startMemoryMonitoring])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return {
    trackMemoryUsage,
    cleanup,
    forceGarbageCollection,
    getMemoryMetrics,
    getDetailedMetrics,
    checkForMemoryLeaks,
    startMemoryMonitoring
  }
}
