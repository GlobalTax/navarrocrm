
// Performance optimization utilities

// Debounce function with cleanup
export const createDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T & { cancel: () => void } => {
  let timeoutId: NodeJS.Timeout

  const debouncedFn = ((...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }) as T & { cancel: () => void }

  debouncedFn.cancel = () => {
    clearTimeout(timeoutId)
  }

  return debouncedFn
}

// Throttle function with cleanup
export const createThrottle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T & { cancel: () => void } => {
  let timeoutId: NodeJS.Timeout | null = null
  let lastExecTime = 0

  const throttledFn = ((...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastExecTime > delay) {
      func.apply(null, args)
      lastExecTime = now
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        func.apply(null, args)
        lastExecTime = Date.now()
        timeoutId = null
      }, delay - (now - lastExecTime))
    }
  }) as T & { cancel: () => void }

  throttledFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return throttledFn
}

// Memory-safe async operation handler
export const createAsyncHandler = <T>(
  asyncFn: () => Promise<T>
): {
  execute: () => Promise<T>
  cancel: () => void
  isActive: () => boolean
} => {
  let abortController: AbortController | null = null
  let isActive = false

  const execute = async (): Promise<T> => {
    // Cancel previous operation
    if (abortController) {
      abortController.abort()
    }

    abortController = new AbortController()
    isActive = true

    try {
      const result = await asyncFn()
      
      if (abortController.signal.aborted) {
        throw new Error('Operation cancelled')
      }

      isActive = false
      return result
    } catch (error) {
      isActive = false
      throw error
    }
  }

  const cancel = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    isActive = false
  }

  const checkIsActive = () => isActive

  return {
    execute,
    cancel,
    isActive: checkIsActive
  }
}

// Cleanup manager for complex components
export class CleanupManager {
  private cleanupFunctions: (() => void)[] = []
  private timers: Set<NodeJS.Timeout> = new Set()
  private intervals: Set<NodeJS.Timeout> = new Set()
  private abortControllers: Set<AbortController> = new Set()

  addCleanup(fn: () => void) {
    this.cleanupFunctions.push(fn)
  }

  addTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timeout = setTimeout(() => {
      this.timers.delete(timeout)
      callback()
    }, delay)
    
    this.timers.add(timeout)
    return timeout
  }

  addInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const interval = setInterval(callback, delay)
    this.intervals.add(interval)
    return interval
  }

  createAbortController(): AbortController {
    const controller = new AbortController()
    this.abortControllers.add(controller)
    return controller
  }

  cleanup() {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()

    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals.clear()

    // Abort all controllers
    this.abortControllers.forEach(controller => controller.abort())
    this.abortControllers.clear()

    // Run custom cleanup functions
    this.cleanupFunctions.forEach(fn => {
      try {
        fn()
      } catch (error) {
        console.error('Error in cleanup function:', error)
      }
    })
    this.cleanupFunctions.length = 0
  }
}

// React hook for cleanup manager
import { useRef, useEffect } from 'react'

export const useCleanupManager = () => {
  const managerRef = useRef<CleanupManager>()

  if (!managerRef.current) {
    managerRef.current = new CleanupManager()
  }

  useEffect(() => {
    return () => {
      managerRef.current?.cleanup()
    }
  }, [])

  return managerRef.current
}

// Memory leak detector for development
export const detectMemoryLeaks = () => {
  if (process.env.NODE_ENV !== 'development') return

  const initialMemory = (performance as any).memory?.usedJSHeapSize
  if (!initialMemory) return

  let checkCount = 0
  const maxChecks = 10
  const checkInterval = 5000

  const interval = setInterval(() => {
    checkCount++
    const currentMemory = (performance as any).memory?.usedJSHeapSize
    const memoryIncrease = currentMemory - initialMemory
    const memoryMB = memoryIncrease / 1024 / 1024

    if (memoryMB > 20) {
      console.warn(`🚨 [Memory Leak Detected] Memory increased by ${memoryMB.toFixed(2)}MB`)
    } else if (memoryMB > 10) {
      console.warn(`⚠️ [Memory Warning] Memory increased by ${memoryMB.toFixed(2)}MB`)
    } else {
      console.log(`✅ [Memory OK] Memory increase: ${memoryMB.toFixed(2)}MB`)
    }

    if (checkCount >= maxChecks) {
      clearInterval(interval)
    }
  }, checkInterval)

  return () => clearInterval(interval)
}
