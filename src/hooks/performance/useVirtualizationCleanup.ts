
import { useEffect, useRef, useCallback } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface VirtualizationCleanupOptions {
  itemCount: number
  componentName: string
  cleanupThreshold?: number
  memoryCheckInterval?: number
}

export const useVirtualizationCleanup = ({
  itemCount,
  componentName,
  cleanupThreshold = 1000,
  memoryCheckInterval = 30000 // 30 segundos
}: VirtualizationCleanupOptions) => {
  const logger = useLogger(`VirtualizationCleanup:${componentName}`)
  const cleanupIntervalRef = useRef<NodeJS.Timeout>()
  const performanceObserverRef = useRef<PerformanceObserver>()

  // Limpiar memoria no utilizada
  const performCleanup = useCallback(() => {
    if (itemCount > cleanupThreshold) {
      // Forzar garbage collection si está disponible
      if ('gc' in window && typeof (window as any).gc === 'function') {
        try {
          (window as any).gc()
          logger.debug('🧹 Garbage collection ejecutado', { itemCount })
        } catch (error) {
          logger.warn('Error en garbage collection:', error)
        }
      }

      // Limpiar imágenes no visibles del DOM
      const images = document.querySelectorAll('img[data-virtualized="true"]')
      images.forEach(img => {
        const rect = img.getBoundingClientRect()
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) {
          img.removeAttribute('src')
        }
      })

      logger.info('🧹 Limpieza de memoria completada', { 
        itemCount, 
        imagesProcessed: images.length 
      })
    }
  }, [itemCount, cleanupThreshold, logger])

  // Monitorear performance
  const setupPerformanceMonitoring = useCallback(() => {
    if (typeof PerformanceObserver !== 'undefined') {
      performanceObserverRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.entryType === 'measure' && entry.name.includes(componentName)) {
            if (entry.duration > 16) { // > 16ms = potential frame drop
              logger.warn('⚠️ Posible frame drop detectado', {
                component: componentName,
                duration: entry.duration,
                itemCount
              })
            }
          }
        })
      })

      performanceObserverRef.current.observe({ 
        entryTypes: ['measure', 'navigation', 'paint'] 
      })
    }
  }, [componentName, itemCount, logger])

  useEffect(() => {
    // Configurar limpieza periódica
    cleanupIntervalRef.current = setInterval(performCleanup, memoryCheckInterval)
    
    // Configurar monitoreo de performance
    setupPerformanceMonitoring()

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
      }
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect()
      }
    }
  }, [performCleanup, setupPerformanceMonitoring, memoryCheckInterval])

  // Cleanup manual para situaciones críticas
  const forceCleanup = useCallback(() => {
    performCleanup()
    logger.info('🚨 Limpieza manual ejecutada', { itemCount })
  }, [performCleanup, itemCount, logger])

  return { forceCleanup }
}
