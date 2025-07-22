
import { useEffect, useRef } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

export const useMemoryTracker = (componentName: string, interval: number = 5000) => {
  const intervalRef = useRef<NodeJS.Timeout>()
  const initialMemory = useRef<number>()
  const isDevMode = process.env.NODE_ENV === 'development'
  const logger = useLogger('MemoryTracker')

  useEffect(() => {
    if (!isDevMode || !(performance as any).memory) return

    const memory = (performance as any).memory as MemoryInfo
    initialMemory.current = memory.usedJSHeapSize

    const trackMemory = () => {
      const currentMemory = memory.usedJSHeapSize
      const memoryDiff = currentMemory - (initialMemory.current || 0)
      const memoryMB = currentMemory / 1024 / 1024
      const diffMB = memoryDiff / 1024 / 1024

      logger.debug(`Memory stats for ${componentName}`, {
        memoryMB: memoryMB.toFixed(2),
        diffMB: (diffMB > 0 ? '+' : '') + diffMB.toFixed(2)
      })

      // Warning for memory leaks
      if (diffMB > 10) {
        logger.warn(`Memory Leak detected in ${componentName}`, {
          increaseMB: diffMB.toFixed(2)
        })
      }

      // Critical warning
      if (memoryMB > 100) {
        logger.error(`Critical memory usage in ${componentName}`, {
          memoryMB: memoryMB.toFixed(2),
          threshold: 100
        })
      }
    }

    intervalRef.current = setInterval(trackMemory, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Final memory check
      if (initialMemory.current) {
        const finalMemory = memory.usedJSHeapSize
        const leaked = finalMemory - initialMemory.current
        
        if (leaked > 1024 * 1024) { // More than 1MB
          logger.warn(`Potential memory leak in ${componentName}`, {
            leakedMB: (leaked / 1024 / 1024).toFixed(2)
          })
        }
      }
    }
  }, [componentName, interval, isDevMode, logger])
}
