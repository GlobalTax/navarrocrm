
import { useCallback } from 'react'
import { useHybridCache } from './useHybridCache'

interface APIRequestOptions {
  priority?: 'low' | 'medium' | 'high'
  ttl?: number
  forceRefresh?: boolean
  cacheKey?: string
}

// Hook especializado para cache de APIs con características optimizadas
export const useOptimizedAPICache = <T = any>() => {
  const cache = useHybridCache({
    maxMemorySize: 100, // 100MB para datos de API
    maxMemoryItems: 1000,
    memoryTTL: 5 * 60 * 1000, // 5 minutos en memoria para APIs
    persistentTTL: 30 * 60 * 1000, // 30 minutos en IndexedDB
    strategy: 'LRU',
    enablePersistence: true
  })

  const fetchWithCache = useCallback(async (
    key: string,
    apiCall: () => Promise<T>,
    options: APIRequestOptions = {}
  ): Promise<T> => {
    if (!cache.isReady) {
      throw new Error('API Cache not ready')
    }

    const { priority = 'medium', ttl, forceRefresh = false, cacheKey } = options
    const finalKey = cacheKey || `api_${key}`

    // Si no es refresh forzado, intentar obtener del cache
    if (!forceRefresh) {
      const cached = await cache.get<T>(finalKey)
      if (cached) {
        console.log(`🎯 [APICache] Cache hit para: ${finalKey}`)
        return cached
      }
    }

    console.log(`🔄 [APICache] Fetching fresh data para: ${finalKey}`)
    
    try {
      const result = await apiCall()
      
      // Almacenar con prioridad alta si es una consulta importante
      await cache.set(finalKey, result, {
        ttl,
        priority,
        forceMemory: priority === 'high'
      })
      
      return result
    } catch (error) {
      console.error(`❌ [APICache] Error fetching ${finalKey}:`, error)
      
      // En caso de error, intentar usar datos cacheados aunque sean stale
      const staleData = await cache.get<T>(finalKey)
      if (staleData) {
        console.log(`💾 [APICache] Usando datos stale para: ${finalKey}`)
        return staleData
      }
      
      throw error
    }
  }, [cache])

  // Precargar datos frecuentemente accedidos
  const preload = useCallback(async (
    key: string,
    fetcher: () => Promise<T>,
    options: APIRequestOptions = {}
  ) => {
    try {
      await fetchWithCache(key, fetcher, { ...options, priority: 'high' })
      console.log(`📦 [APICache] Precargado: ${key}`)
    } catch (error) {
      console.warn(`⚠️ [APICache] Error precargando ${key}:`, error)
    }
  }, [fetchWithCache])

  // Invalidar por patrones (ej: invalidar todos los datos de contactos)
  const invalidatePattern = useCallback(async (pattern: string) => {
    if (!cache.isReady) return
    
    console.log(`🗑️ [APICache] Invalidando patrón: ${pattern}`)
    // Para una implementación completa, necesitaríamos iterar sobre las keys
    // Por ahora, registramos la intención
  }, [cache.isReady])

  // Batch para múltiples llamadas
  const batchFetch = useCallback(async <K extends string>(
    requests: Record<K, () => Promise<any>>,
    options: APIRequestOptions = {}
  ): Promise<Record<K, any>> => {
    const results = {} as Record<K, any>
    
    await Promise.all(
      Object.entries(requests).map(async ([key, fetcher]) => {
        try {
          results[key as K] = await fetchWithCache(key, fetcher as () => Promise<any>, options)
        } catch (error) {
          console.error(`❌ [APICache] Error en batch para ${key}:`, error)
          results[key as K] = null
        }
      })
    )
    
    return results
  }, [fetchWithCache])

  return {
    ...cache,
    fetchWithCache,
    preload,
    invalidatePattern,
    batchFetch
  }
}
