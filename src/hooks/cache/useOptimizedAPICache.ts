
import { useCallback, useRef, useEffect } from 'react'
import { useHybridCache } from './useHybridCache'
import { ENV_CONFIG } from '@/config/environment'

interface OptimizedAPICacheConfig {
  defaultTTL?: number
  highPriorityTTL?: number
  maxItems?: number
  enablePersistence?: boolean
  enablePreloading?: boolean
}

interface CacheMetrics {
  hits: number
  misses: number
  hitRate: number
  totalRequests: number
  cacheSize: number
}

export const useOptimizedAPICache = (config?: OptimizedAPICacheConfig) => {
  const {
    defaultTTL = 5 * 60 * 1000, // 5 minutos
    highPriorityTTL = 10 * 60 * 1000, // 10 minutos
    maxItems = 1000,
    enablePersistence = true,
    enablePreloading = true
  } = config || {}

  const cache = useHybridCache({
    maxMemorySize: 100, // 100MB
    maxIndexedDBSize: ENV_CONFIG.cache.maxSize,
    maxMemoryItems: maxItems,
    memoryTTL: 2 * 60 * 1000, // 2 minutos en memoria
    persistentTTL: defaultTTL,
    enablePersistence
  })

  const metricsRef = useRef<CacheMetrics>({
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalRequests: 0,
    cacheSize: 0
  })

  // Actualizar métricas
  const updateMetrics = useCallback((isHit: boolean) => {
    const metrics = metricsRef.current
    metrics.totalRequests++
    
    if (isHit) {
      metrics.hits++
    } else {
      metrics.misses++
    }
    
    metrics.hitRate = metrics.hits / metrics.totalRequests
    
    if (cache.stats) {
      metrics.cacheSize = cache.stats.memoryItems + cache.stats.persistentItems
    }
  }, [cache.stats])

  // Función principal para obtener/cachear datos
  const fetchWithCache = useCallback(async <T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: {
      ttl?: number
      priority?: 'medium' | 'high'
      forceRefresh?: boolean
    }
  ): Promise<T> => {
    const { ttl, priority = 'medium', forceRefresh = false } = options || {}

    // Si no se fuerza refresh, intentar obtener del cache
    if (!forceRefresh && cache.isReady) {
      const cachedData = await cache.get<T>(key)
      if (cachedData !== null) {
        updateMetrics(true)
        if (ENV_CONFIG.development.enableLogs) {
          console.log(`🎯 [Cache HIT] ${key}`)
        }
        return cachedData
      }
    }

    // Cache miss - obtener datos
    updateMetrics(false)
    if (ENV_CONFIG.development.enableLogs) {
      console.log(`💾 [Cache MISS] ${key}`)
    }

    try {
      const data = await fetcher()
      
      // Cachear los datos obtenidos
      if (cache.isReady) {
        const cacheTTL = ttl || (priority === 'high' ? highPriorityTTL : defaultTTL)
        await cache.set(key, data, {
          ttl: cacheTTL,
          priority,
          forceMemory: priority === 'high'
        })
      }

      return data
    } catch (error) {
      console.error(`❌ [Cache] Error fetching data for ${key}:`, error)
      throw error
    }
  }, [cache, updateMetrics, defaultTTL, highPriorityTTL])

  // Precargar datos críticos
  const preloadData = useCallback(async <T>(
    key: string,
    fetcher: () => Promise<T>,
    priority: 'high' | 'medium' = 'medium'
  ) => {
    if (!enablePreloading || !cache.isReady) return

    try {
      const data = await fetcher()
      await cache.set(key, data, {
        ttl: priority === 'high' ? highPriorityTTL : defaultTTL,
        priority,
        forceMemory: priority === 'high'
      })
      
      if (ENV_CONFIG.development.enableLogs) {
        console.log(`🚀 [Cache PRELOAD] ${key}`)
      }
    } catch (error) {
      console.warn(`⚠️ [Cache] Error preloading ${key}:`, error)
    }
  }, [cache, enablePreloading, defaultTTL, highPriorityTTL])

  // Invalidar cache por patrón
  const invalidatePattern = useCallback(async (pattern: string) => {
    if (!cache.isReady) return

    // Para una implementación simple, limpiamos todo el cache
    // En una implementación avanzada, iteraríamos sobre las keys
    await cache.clear()
    
    if (ENV_CONFIG.development.enableLogs) {
      console.log(`🗑️ [Cache INVALIDATE] Pattern: ${pattern}`)
    }
  }, [cache])

  // Invalidar cache específico
  const invalidateKey = useCallback(async (key: string) => {
    if (!cache.isReady) return
    
    await cache.remove(key)
    
    if (ENV_CONFIG.development.enableLogs) {
      console.log(`🗑️ [Cache INVALIDATE] Key: ${key}`)
    }
  }, [cache])

  // Obtener métricas
  const getMetrics = useCallback((): CacheMetrics & { cacheStats?: any } => {
    return {
      ...metricsRef.current,
      cacheStats: cache.stats
    }
  }, [cache.stats])

  // Limpiar cache
  const clearCache = useCallback(async () => {
    if (cache.isReady) {
      await cache.clear()
      // Reset metrics
      metricsRef.current = {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalRequests: 0,
        cacheSize: 0
      }
    }
  }, [cache])

  return {
    // Funciones principales
    fetchWithCache,
    preloadData,
    
    // Gestión de cache
    invalidatePattern,
    invalidateKey,
    clearCache,
    
    // Métricas y estadísticas
    getMetrics,
    
    // Estado del cache
    isReady: cache.isReady,
    stats: cache.stats
  }
}
