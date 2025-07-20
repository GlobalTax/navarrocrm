import { useMemo, useRef, useCallback } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface SmartMemoOptions<T> {
  key?: string
  maxCacheSize?: number
  ttl?: number // time to live in ms
  deepEqual?: boolean
}

interface CacheEntry<T> {
  value: T
  timestamp: number
  accessCount: number
}

// Global cache with LRU eviction
const globalCache = new Map<string, CacheEntry<any>>()
const MAX_GLOBAL_CACHE_SIZE = 100

function evictLRU() {
  if (globalCache.size >= MAX_GLOBAL_CACHE_SIZE) {
    let oldest = Array.from(globalCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]
    
    if (oldest) {
      globalCache.delete(oldest[0])
    }
  }
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== 'object' || typeof b !== 'object') return false
  
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  for (let key of keysA) {
    if (!keysB.includes(key)) return false
    if (!deepEqual(a[key], b[key])) return false
  }
  
  return true
}

export function useSmartMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  options: SmartMemoOptions<T> = {}
): T {
  const logger = useLogger('SmartMemo')
  const {
    key,
    maxCacheSize = 10,
    ttl = 5 * 60 * 1000, // 5 minutes default
    deepEqual: useDeepEqual = false
  } = options

  const localCache = useRef(new Map<string, CacheEntry<T>>())
  const depsRef = useRef<React.DependencyList>([])
  const computationCountRef = useRef(0)

  // Generate cache key
  const cacheKey = key || `memo_${JSON.stringify(deps)}`

  // Check if dependencies changed
  const depsChanged = useCallback(() => {
    if (depsRef.current.length !== deps.length) return true
    
    return deps.some((dep, index) => {
      const prev = depsRef.current[index]
      return useDeepEqual ? !deepEqual(dep, prev) : dep !== prev
    })
  }, [deps, useDeepEqual])

  return useMemo(() => {
    const now = Date.now()
    
    // Check local cache first
    const localEntry = localCache.current.get(cacheKey)
    if (localEntry && (now - localEntry.timestamp) < ttl && !depsChanged()) {
      localEntry.accessCount++
      logger.info('🎯 Cache hit (local)', { 
        cacheKey: cacheKey.substring(0, 50),
        accessCount_: localEntry.accessCount 
      })
      return localEntry.value
    }

    // Check global cache
    const globalEntry = globalCache.get(cacheKey)
    if (globalEntry && (now - globalEntry.timestamp) < ttl && !depsChanged()) {
      globalEntry.accessCount++
      // Copy to local cache
      localCache.current.set(cacheKey, { ...globalEntry })
      logger.info('🌐 Cache hit (global)', { 
        cacheKey: cacheKey.substring(0, 50),
        accessCount_: globalEntry.accessCount 
      })
      return globalEntry.value
    }

    // Compute new value
    const startTime = performance.now()
    const value = factory()
    const computationTime = (performance.now() - startTime).toFixed(2)
    
    computationCountRef.current++
    
    // Create cache entry
    const entry: CacheEntry<T> = {
      value,
      timestamp: now,
      accessCount: 1
    }

    // Store in local cache (with LRU eviction)
    if (localCache.current.size >= maxCacheSize) {
      const oldestKey = Array.from(localCache.current.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]?.[0]
      
      if (oldestKey) {
        localCache.current.delete(oldestKey)
      }
    }
    localCache.current.set(cacheKey, entry)

    // Store in global cache
    evictLRU()
    globalCache.set(cacheKey, { ...entry })

    // Update deps reference
    depsRef.current = [...deps]

      logger.info('🔄 Valor computado', {
        cacheKey: cacheKey.substring(0, 50),
        computationTime: `${computationTime}ms`,
        totalComputations: computationCountRef.current,
        localCacheSize_: localCache.current.size,
        globalCacheSize_: globalCache.size
      })

    return value
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}

// Hook for clearing caches
export function useClearMemoCache() {
  const logger = useLogger('SmartMemo')

  return useCallback((pattern?: string) => {
    if (pattern) {
      const regex = new RegExp(pattern)
      for (const [key] of globalCache) {
        if (regex.test(key)) {
          globalCache.delete(key)
        }
      }
      logger.info('🧹 Cache parcial limpiado', { pattern })
    } else {
      globalCache.clear()
      logger.info('🧹 Cache global limpiado')
    }
  }, [logger])
}