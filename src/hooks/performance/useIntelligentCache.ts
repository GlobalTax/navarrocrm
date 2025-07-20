
import { useState, useEffect, useCallback } from 'react'
import { useNetworkStatus } from './useNetworkStatus'

interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

interface CacheConfig {
  defaultTTL: number
  maxSize: number
  strategy: 'lru' | 'lfu' | 'ttl'
}

interface IntelligentCache {
  get: <T>(key: string) => T | null
  set: <T>(key: string, data: T, ttl?: number) => void
  remove: (key: string) => void  
  clear: () => void
  getStats: () => CacheStats
  prefetch: <T>(key: string, fetcher: () => Promise<T>, ttl?: number) => Promise<T>
}

interface CacheStats {
  size: number
  maxSize: number
  hitRate: number
  totalRequests: number
  totalHits: number
}

const DEFAULT_CONFIG: CacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  strategy: 'lru'
}

export const useIntelligentCache = (config: Partial<CacheConfig> = {}): IntelligentCache => {
  const { networkInfo } = useNetworkStatus()
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map())
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalHits: 0
  })

  const updateStats = useCallback((hit: boolean) => {
    setStats(prev => ({
      totalRequests: prev.totalRequests + 1,
      totalHits: prev.totalHits + (hit ? 1 : 0)
    }))
  }, [])

  const isExpired = useCallback((entry: CacheEntry): boolean => {
    return Date.now() - entry.timestamp > entry.ttl
  }, [])

  const evictIfNeeded = useCallback(() => {
    if (cache.size < finalConfig.maxSize) return

    const entries = Array.from(cache.entries())
    let toEvict: string | null = null

    switch (finalConfig.strategy) {
      case 'lru':
        // Evict least recently used
        toEvict = entries.reduce((oldest, [key, entry]) => {
          const [oldestKey, oldestEntry] = oldest
          return entry.lastAccessed < oldestEntry.lastAccessed ? [key, entry] : oldest
        })[0]
        break

      case 'lfu':
        // Evict least frequently used
        toEvict = entries.reduce((least, [key, entry]) => {
          const [leastKey, leastEntry] = least
          return entry.accessCount < leastEntry.accessCount ? [key, entry] : least
        })[0]
        break

      case 'ttl':
        // Evict oldest by timestamp
        toEvict = entries.reduce((oldest, [key, entry]) => {
          const [oldestKey, oldestEntry] = oldest
          return entry.timestamp < oldestEntry.timestamp ? [key, entry] : oldest
        })[0]
        break
    }

    if (toEvict) {
      setCache(prev => {
        const newCache = new Map(prev)
        newCache.delete(toEvict)
        return newCache
      })
    }
  }, [cache.size, finalConfig.maxSize, finalConfig.strategy])

  const get = useCallback(<T>(key: string): T | null => {
    updateStats(false) // Will be updated to true if hit

    const entry = cache.get(key)
    if (!entry) {
      return null
    }

    if (isExpired(entry)) {
      setCache(prev => {
        const newCache = new Map(prev)
        newCache.delete(key)
        return newCache
      })
      return null
    }

    // Update access statistics
    setCache(prev => {
      const newCache = new Map(prev)
      const updatedEntry = {
        ...entry,
        accessCount: entry.accessCount + 1,
        lastAccessed: Date.now()
      }
      newCache.set(key, updatedEntry)
      return newCache
    })

    updateStats(true)
    return entry.data as T
  }, [cache, isExpired, updateStats])

  const set = useCallback(<T>(key: string, data: T, ttl?: number): void => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || finalConfig.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now()
    }

    setCache(prev => {
      const newCache = new Map(prev)
      newCache.set(key, entry)
      return newCache
    })

    // Schedule cleanup if needed
    setTimeout(() => evictIfNeeded(), 0)
  }, [finalConfig.defaultTTL, evictIfNeeded])

  const remove = useCallback((key: string): void => {
    setCache(prev => {
      const newCache = new Map(prev)
      newCache.delete(key)
      return newCache
    })
  }, [])

  const clear = useCallback((): void => {
    setCache(new Map())
    setStats({ totalRequests: 0, totalHits: 0 })
  }, [])

  const getStats = useCallback((): CacheStats => {
    const hitRate = stats.totalRequests > 0 ? stats.totalHits / stats.totalRequests : 0
    
    return {
      size: cache.size,
      maxSize: finalConfig.maxSize,
      hitRate: hitRate * 100,
      totalRequests: stats.totalRequests,
      totalHits: stats.totalHits
    }
  }, [cache.size, finalConfig.maxSize, stats])

  const prefetch = useCallback(async <T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl?: number
  ): Promise<T> => {
    // Check if already cached and valid
    const cached = get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Only prefetch if online to avoid unnecessary requests
    if (!networkInfo.isOnline) {
      throw new Error('Cannot prefetch while offline')
    }

    try {
      const data = await fetcher()
      set(key, data, ttl)
      return data
    } catch (error) {
      console.error(`Failed to prefetch data for key: ${key}`, error)
      throw error
    }
  }, [get, set, networkInfo.isOnline])

  // Auto-cleanup expired entries periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      setCache(prev => {
        const newCache = new Map()
        
        for (const [key, entry] of prev.entries()) {
          if (!isExpired(entry)) {
            newCache.set(key, entry)
          }
        }
        
        return newCache
      })
    }, 60000) // Check every minute

    return () => clearInterval(cleanup)
  }, [isExpired])

  // Adjust TTL based on network conditions
  useEffect(() => {
    if (!networkInfo.isOnline) {
      // Extend TTL for offline mode to preserve data longer
      setCache(prev => {
        const newCache = new Map()
        
        for (const [key, entry] of prev.entries()) {
          newCache.set(key, {
            ...entry,
            ttl: entry.ttl * 2 // Double the TTL when offline
          })
        }
        
        return newCache
      })
    }
  }, [networkInfo.isOnline])

  return {
    get,
    set,
    remove,
    clear,
    getStats,
    prefetch
  }
}
