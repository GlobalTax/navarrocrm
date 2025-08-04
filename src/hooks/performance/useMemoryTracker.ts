import { useEffect, useRef } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

export const useMemoryTracker = (componentName: string, interval: number = 5000) => {
  const logger = useLogger('MemoryTracker')
  const intervalRef = useRef<NodeJS.Timeout>()
  const isDevMode = process.env.NODE_ENV === 'development'

  useEffect(() => {
    if (!isDevMode) return

    // Check if performance.memory is available (Chrome/Edge)
    const performance = window.performance as any
    if (!performance?.memory) {
      logger.warn('Memory tracking not available in this browser')
      return
    }

    const trackMemory = () => {
      try {
        const memory: MemoryInfo = performance.memory
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
        const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024)
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024)

        // Log memory usage
        logger.info(`🧠 [Memory] ${componentName}: ${usedMB}MB/${limitMB}MB (${Math.round((usedMB / limitMB) * 100)}%)`, {
          memory: { used: usedMB, total: totalMB, limit: limitMB }
        })

        // Warning thresholds
        const usagePercentage = (usedMB / limitMB) * 100
        
        if (usagePercentage > 80) {
          logger.warn(`⚠️ [Memory] High memory usage in ${componentName}: ${usagePercentage.toFixed(1)}%`)
        }
        
        if (usagePercentage > 90) {
          logger.error(`🚨 [Memory] Critical memory usage in ${componentName}: ${usagePercentage.toFixed(1)}%`)
          
          // Suggest garbage collection (if available)
          if (window.gc && typeof window.gc === 'function') {
            logger.info('🗑️ [Memory] Suggesting garbage collection')
            window.gc()
          }
        }

      } catch (error) {
        logger.error('Memory tracking error', { error })
      }
    }

    // Initial measurement
    trackMemory()

    // Set up interval
    intervalRef.current = setInterval(trackMemory, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [componentName, interval, isDevMode, logger])

  // Manual memory check function
  const checkMemory = () => {
    if (!isDevMode) return null

    const performance = window.performance as any
    if (!performance?.memory) return null

    const memory: MemoryInfo = performance.memory
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
    }
  }

  return { checkMemory }
}

// Hook para tracking de memoria global
export const useGlobalMemoryTracker = () => {
  const logger = useLogger('GlobalMemoryTracker')

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const trackGlobalMemory = () => {
      const performance = window.performance as any
      if (!performance?.memory) return

      const memory: MemoryInfo = performance.memory
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
      const percentage = Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)

      // Store in global performance object for monitoring
      ;(window as any).__APP_MEMORY__ = {
        used: usedMB,
        percentage,
        timestamp: Date.now()
      }

      // Critical memory warning
      if (percentage > 85) {
        console.warn(`🚨 Global memory usage critical: ${percentage}% (${usedMB}MB)`)
        
        // Dispatch custom event for other components to react
        window.dispatchEvent(new CustomEvent('app:memory-warning', {
          detail: { percentage, used: usedMB }
        }))
      }
    }

    // Track every 10 seconds
    const interval = setInterval(trackGlobalMemory, 10000)
    
    // Initial track
    trackGlobalMemory()

    return () => clearInterval(interval)
  }, [logger])
}