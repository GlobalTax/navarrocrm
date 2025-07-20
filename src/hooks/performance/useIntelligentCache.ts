import { useCallback, useEffect, useRef } from 'react'
import { useNetworkStatus } from './useNetworkStatus'
import { useOfflineStorage } from './useOfflineStorage'
import { useLogger } from '@/hooks/useLogger'

interface CacheConfig {
  key: string
  ttlOnline?: number // TTL when online (shorter)
  ttlOffline?: number // TTL when offline (longer)
  syncOnReconnect?: boolean
  priority?: 'low' | 'medium' | 'high' | 'critical'
  maxRetries?: number
  retryDelay?: number
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  source: 'cache' | 'network'
  priority: string
  retryCount: number
}

interface IntelligentCacheReturn<T> {
  data: T | null
  isLoading: boolean
  isStale: boolean
  error: string | null
  refetch: () => Promise<void>
  invalidate: () => Promise<void>
  updateCache: (data: T) => Promise<void>
}

export function useIntelligentCache<T>(
  fetcher: () => Promise<T>,
  config: CacheConfig
): IntelligentCacheReturn<T> {
  const logger = useLogger('IntelligentCache')
  const { isOnline, isSlowConnection } = useNetworkStatus()
  
  const {
    key,
    ttlOnline = 5 * 60 * 1000, // 5 minutes online
    ttlOffline = 24 * 60 * 60 * 1000, // 24 hours offline
    syncOnReconnect = true,
    priority = 'medium',
    maxRetries = 3,
    retryDelay = 1000
  } = config

  const retryCountRef = useRef(0)
  const lastFetchAttempt = useRef<number>(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Use appropriate TTL based on network status
  const currentTtl = isOnline ? ttlOnline : ttlOffline

  const {
    data: cachedData,
    setData: setCachedData,
    removeData,
    isLoading: storageLoading,
    error: storageError
  } = useOfflineStorage<CacheEntry<T>>({
    key: `cache_${key}`,
    ttl: currentTtl,
    compress: true,
    sync: syncOnReconnect
  })

  // Check if data is stale
  const isStale = cachedData ? 
    Date.now() - cachedData.timestamp > currentTtl : 
    true

  const shouldFetch = isOnline && (
    !cachedData || 
    isStale || 
    (syncOnReconnect && cachedData.source === 'cache')
  )

  // Fetch data with retry logic
  const fetchData = useCallback(async (): Promise<T | null> => {
    if (!isOnline) {
      logger.info('📶 Offline, usando cache', { key, priority })
      return cachedData?.data || null
    }

    // Prevent too frequent requests
    const timeSinceLastAttempt = Date.now() - lastFetchAttempt.current
    if (timeSinceLastAttempt < 1000) {
      logger.debug('🚫 Petición muy frecuente, ignorando', { key })
      return cachedData?.data || null
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    lastFetchAttempt.current = Date.now()

    try {
      logger.info('🔄 Obteniendo datos', { 
        key, 
        priority, 
        isSlowConnection,
        retryCount: retryCountRef.current 
      })

      const startTime = performance.now()
      const result = await fetcher()
      const fetchTime = performance.now() - startTime

      // Create cache entry
      const entry: CacheEntry<T> = {
        data: result,
        timestamp: Date.now(),
        source: 'network',
        priority,
        retryCount: retryCountRef.current
      }

      await setCachedData(entry)
      retryCountRef.current = 0

      logger.info('✅ Datos obtenidos y cacheados', { 
        key, 
        fetchTime: `${fetchTime.toFixed(2)}ms`,
        priority 
      })

      return result

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        logger.debug('🚫 Petición cancelada', { key })
        return cachedData?.data || null
      }

      retryCountRef.current++
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'

      logger.error('❌ Error obteniendo datos', { 
        key, 
        error: errorMsg,
        retryCount: retryCountRef.current,
        maxRetries_: maxRetries
      })

      // Retry logic
      if (retryCountRef.current < maxRetries) {
        const delay = retryDelay * Math.pow(2, retryCountRef.current - 1)
        
        logger.info('🔄 Reintentando en...', { 
          key, 
          delay: delay,
          attempts: retryCountRef.current 
        })

        await new Promise(resolve => setTimeout(resolve, delay))
        return fetchData()
      }

      // Return cached data if available, otherwise throw
      if (cachedData?.data) {
        logger.warn('⚠️ Usando datos en cache por error', { key })
        return cachedData.data
      }

      throw error
    }
  }, [isOnline, cachedData, key, priority, isSlowConnection, fetcher, maxRetries, retryDelay, setCachedData, logger])

  // Auto-fetch when conditions are met
  useEffect(() => {
    if (shouldFetch && !storageLoading) {
      fetchData()
    }
  }, [shouldFetch, storageLoading, fetchData])

  // Sync on reconnect
  useEffect(() => {
    if (isOnline && syncOnReconnect && cachedData?.source === 'cache') {
      logger.info('🔄 Sincronizando al reconectar', { key })
      fetchData()
    }
  }, [isOnline, syncOnReconnect, cachedData?.source, key, fetchData, logger])

  const refetch = useCallback(async () => {
    retryCountRef.current = 0
    await fetchData()
  }, [fetchData])

  const invalidate = useCallback(async () => {
    await removeData()
    retryCountRef.current = 0
    if (isOnline) {
      await fetchData()
    }
  }, [removeData, isOnline, fetchData])

  const updateCache = useCallback(async (data: T) => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      source: 'cache',
      priority,
      retryCount: 0
    }
    await setCachedData(entry)
  }, [setCachedData, priority])

  return {
    data: cachedData?.data || null,
    isLoading: storageLoading,
    isStale,
    error: storageError,
    refetch,
    invalidate,
    updateCache
  }
}