import { useEffect, useRef } from 'react'
import { performanceLogger } from '@/utils/logging'

interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

export const useMemoryTracker = (componentName: string, interval: number = 5000) => {
  const intervalRef = useRef<NodeJS.Timeout>()
  const initialMemory = useRef<number>()
  const isDevMode = process.env.NODE_ENV === 'development'

  useEffect(() => {
    if (!isDevMode || !(performance as any).memory) return

    const memory = (performance as any).memory as MemoryInfo
    initialMemory.current = memory.usedJSHeapSize

    const trackMemory = () => {
      const currentMemory = memory.usedJSHeapSize
      const memoryDiff = currentMemory - (initialMemory.current || 0)
      const memoryMB = currentMemory / 1024 / 1024
      const diffMB = memoryDiff / 1024 / 1024

      performanceLogger.info('Memoria actual', { 
        component: componentName, 
        memoryMB: Number(memoryMB.toFixed(2)), 
        diffMB: Number(diffMB.toFixed(2)) 
      })

      // Warning for memory leaks
      if (diffMB > 10) {
        performanceLogger.warn('Posible memory leak', { 
          component: componentName, 
          memoryIncrease: Number(diffMB.toFixed(2)) 
        })
      }

      // Critical warning
      if (memoryMB > 100) {
        performanceLogger.error('Uso crítico de memoria', { 
          component: componentName, 
          memoryMB: Number(memoryMB.toFixed(2)) 
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
          performanceLogger.warn('Posible memory leak al desmontar', { 
            component: componentName, 
            leakedMB: Number((leaked / 1024 / 1024).toFixed(2)) 
          })
        }
      }
    }
  }, [componentName, interval, isDevMode])
}