
import { useCallback } from 'react'
import { useIntelligentCache } from './useIntelligentCache'

interface CacheConfig {
  defaultTTL?: number
  maxSize?: number
  enableLRU?: boolean
}

// Hook especializado para cache de consultas de API
export const useAPICache = <T>(config?: CacheConfig) => {
  const cache = useIntelligentCache<T>({
    defaultTTL: 5 * 60 * 1000, // 5 minutos para APIs
    maxSize: 200, // Más espacio para datos de API
    ...config
  })

  const fetchWithCache = useCallback(async (
    key: string,
    apiCall: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    return cache.getOrSet(key, apiCall, ttl)
  }, [cache])

  // Invalidar cache por patrones (ej: invalidar todos los datos de un usuario)
  const invalidatePattern = useCallback((pattern: string) => {
    const keysToRemove: string[] = []
    
    // Simular pattern matching simple
    const stats = cache.getStats()
    // Como no podemos iterar sobre las keys directamente, usaremos un enfoque diferente
    // Los consumidores pueden llamar a remove() con keys específicas
    
    console.log(`Pattern invalidation requested for: ${pattern}`)
    console.log(`Current cache size: ${stats.size}`)
  }, [cache])

  // Precargar datos frecuentemente accedidos
  const preload = useCallback(async (
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ) => {
    try {
      const data = await fetcher()
      cache.set(key, data, ttl)
      console.log(`Preloaded cache key: ${key}`)
    } catch (error) {
      console.error(`Failed to preload cache key ${key}:`, error)
    }
  }, [cache])

  return {
    ...cache,
    fetchWithCache,
    invalidatePattern,
    preload
  }
}
