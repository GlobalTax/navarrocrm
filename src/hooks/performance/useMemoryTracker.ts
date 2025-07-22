import { useEffect, useRef } from 'react'

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

      console.log(`🧠 [Memory] ${componentName}: ${memoryMB.toFixed(2)}MB (${diffMB > 0 ? '+' : ''}${diffMB.toFixed(2)}MB)`)

      // Warning for memory leaks
      if (diffMB > 10) {
        console.warn(`⚠️ [Memory Leak] ${componentName} increased memory by ${diffMB.toFixed(2)}MB`)
      }

      // Critical warning
      if (memoryMB > 100) {
        console.error(`🚨 [Memory Critical] ${componentName} using ${memoryMB.toFixed(2)}MB`)
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
          console.warn(`💧 [Memory Leak] ${componentName} may have leaked ${(leaked / 1024 / 1024).toFixed(2)}MB`)
        }
      }
    }
  }, [componentName, interval, isDevMode])
}