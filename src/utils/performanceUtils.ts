// Utilidades para optimización de performance

// Debounce function mejorada
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean; maxWait?: number } = {}
): T & { cancel: () => void; flush: () => ReturnType<T> | undefined } {
  const { leading = false, trailing = true, maxWait } = options
  
  let lastCallTime: number | undefined
  let lastInvokeTime = 0
  let timerId: NodeJS.Timeout | undefined
  let lastArgs: Parameters<T> | undefined
  let lastThis: any
  let result: ReturnType<T>

  function invokeFunc(time: number): ReturnType<T> {
    const args = lastArgs!
    const thisArg = lastThis
    lastArgs = lastThis = undefined
    lastInvokeTime = time
    result = func.apply(thisArg, args)
    return result
  }

  function leadingEdge(time: number): ReturnType<T> {
    lastInvokeTime = time
    timerId = setTimeout(timerExpired, wait)
    return leading ? invokeFunc(time) : result
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = time - lastCallTime!
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall
    
    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - lastCallTime!
    const timeSinceLastInvoke = time - lastInvokeTime

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    )
  }

  function timerExpired(): ReturnType<T> | undefined {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    timerId = setTimeout(timerExpired, remainingWait(time))
    return undefined
  }

  function trailingEdge(time: number): ReturnType<T> {
    timerId = undefined
    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = lastThis = undefined
    return result
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId)
    }
    lastInvokeTime = 0
    lastArgs = lastCallTime = lastThis = timerId = undefined
  }

  function flush(): ReturnType<T> | undefined {
    return timerId === undefined ? result : trailingEdge(Date.now())
  }

  function debounced(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime)
      }
      if (maxWait !== undefined) {
        timerId = setTimeout(timerExpired, wait)
        return invokeFunc(lastCallTime)
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait)
    }
    return result
  }

  debounced.cancel = cancel
  debounced.flush = flush
  return debounced as T & { cancel: () => void; flush: () => ReturnType<T> | undefined }
}

// Throttle function mejorada
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T & { cancel: () => void; flush: () => ReturnType<T> | undefined } {
  return debounce(func, wait, { maxWait: wait, ...options })
}

// Lazy loading de componentes con retry
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: {
    maxRetries?: number
    retryDelay?: number
    fallback?: React.ComponentType
  } = {}
): React.LazyExoticComponent<T> {
  const { maxRetries = 3, retryDelay = 1000 } = options

  let retryCount = 0

  const retryImport = async (): Promise<{ default: T }> => {
    try {
      return await importFunc()
    } catch (error) {
      if (retryCount < maxRetries) {
        retryCount++
        console.warn(`Import failed, retrying (${retryCount}/${maxRetries})...`, error)
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount))
        return retryImport()
      }
      throw error
    }
  }

  return React.lazy(retryImport)
}

// Memoización con TTL
export class MemoizedCache<K, V> {
  private cache = new Map<K, { value: V; timestamp: number }>()
  private readonly ttl: number

  constructor(ttl: number = 5 * 60 * 1000) { // 5 minutos por defecto
    this.ttl = ttl
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return undefined
    }

    return entry.value
  }

  set(key: K, value: V): void {
    this.cache.set(key, { value, timestamp: Date.now() })
  }

  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    // Limpiar entradas expiradas
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key)
      }
    }
    return this.cache.size
  }
}

// Batch de operaciones asíncronas
export class AsyncBatch<T> {
  private batch: (() => Promise<T>)[] = []
  private processing = false
  private readonly batchSize: number
  private readonly delay: number

  constructor(batchSize: number = 10, delay: number = 100) {
    this.batchSize = batchSize
    this.delay = delay
  }

  add(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batch.push(async () => {
        try {
          const result = await operation()
          resolve(result)
          return result
        } catch (error) {
          reject(error)
          throw error
        }
      })

      if (!this.processing) {
        this.processBatch()
      }
    })
  }

  private async processBatch(): Promise<void> {
    if (this.processing) return
    this.processing = true

    while (this.batch.length > 0) {
      const currentBatch = this.batch.splice(0, this.batchSize)
      
      try {
        await Promise.allSettled(currentBatch.map(op => op()))
      } catch (error) {
        console.error('Batch processing error:', error)
      }

      if (this.batch.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay))
      }
    }

    this.processing = false
  }
}

// Monitor de performance en tiempo real
export class PerformanceMonitor {
  private metrics: { [key: string]: number[] } = {}
  private readonly maxEntries: number

  constructor(maxEntries: number = 100) {
    this.maxEntries = maxEntries
  }

  mark(name: string): void {
    performance.mark(name)
  }

  measure(name: string, startMark: string, endMark?: string): number {
    if (endMark) {
      performance.measure(name, startMark, endMark)
    } else {
      performance.measure(name, startMark)
    }

    const entries = performance.getEntriesByName(name, 'measure')
    const latestEntry = entries[entries.length - 1]
    
    if (latestEntry) {
      this.addMetric(name, latestEntry.duration)
      return latestEntry.duration
    }

    return 0
  }

  addMetric(name: string, value: number): void {
    if (!this.metrics[name]) {
      this.metrics[name] = []
    }

    this.metrics[name].push(value)
    
    // Mantener solo las últimas entradas
    if (this.metrics[name].length > this.maxEntries) {
      this.metrics[name].shift()
    }
  }

  getStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics[name]
    if (!values || values.length === 0) return null

    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    return { avg, min, max, count: values.length }
  }

  getAllStats(): { [key: string]: ReturnType<PerformanceMonitor['getStats']> } {
    const result: { [key: string]: ReturnType<PerformanceMonitor['getStats']> } = {}
    
    for (const name of Object.keys(this.metrics)) {
      result[name] = this.getStats(name)
    }

    return result
  }

  clear(name?: string): void {
    if (name) {
      delete this.metrics[name]
    } else {
      this.metrics = {}
    }
  }
}

// Instancia global del monitor
export const globalPerformanceMonitor = new PerformanceMonitor()

// React lazy import
export const React = await import('react')