
import { useCallback } from 'react'
import { useIntelligentCache } from './useIntelligentCache'
import { CacheStats } from './types'

interface CacheConfig {
  defaultTTL?: number
  maxSize?: number
  enableLRU?: boolean
}

// Hook especializado para cache de consultas de API
export const useAPICache = <T = any>(config?: CacheConfig) => {
  const cache = useIntelligentCache({
    maxAge: config?.defaultTTL || 5 * 60 * 1000, // 5 minutos para APIs
    maxSize: config?.maxSize || 200, // Más espacio para datos de API
  })

  const fetchWithCache = useCallback(async (
    key: string,
    apiCall: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    if (!cache.isReady) {
      throw new Error('Cache not ready')
    }

    // Intentar obtener del cache
    const cached = await cache.get<T>(key)
    if (cached) {
      return cached
    }

    // Si no está en cache, hacer la llamada
    const result = await apiCall()
    await cache.set(key, result, ttl)
    return result
  }, [cache])

  // Invalidar cache por patrones (ej: invalidar todos los datos de un usuario)
  const invalidatePattern = useCallback((pattern: string) => {
    console.log(`Pattern invalidation requested for: ${pattern}`)
    // Para implementación simple, solo loggeamos
    // En una implementación completa, iteraríamos sobre las keys
  }, [])

  // Precargar datos frecuentemente accedidos
  const preload = useCallback(async (
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ) => {
    try {
      const data = await fetcher()
      await cache.set(key, data, ttl)
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
