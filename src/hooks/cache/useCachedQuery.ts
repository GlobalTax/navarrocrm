
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { useAPICache } from './useAPICache'
import { useCallback } from 'react'

interface CachedQueryOptions<T> {
  queryKey: string[]
  queryFn: () => Promise<T>
  cacheTTL?: number
  reactQueryOptions?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
}

// Hook que combina React Query con nuestro cache inteligente
export const useCachedQuery = <T>({
  queryKey,
  queryFn,
  cacheTTL,
  reactQueryOptions = {}
}: CachedQueryOptions<T>) => {
  const apiCache = useAPICache<T>()
  const cacheKey = queryKey.join('_')

  // Función de query que usa nuestro cache
  const cachedQueryFn = useCallback(async (): Promise<T> => {
    return apiCache.fetchWithCache(cacheKey, queryFn, cacheTTL)
  }, [apiCache, cacheKey, queryFn, cacheTTL])

  // Usar React Query con nuestra función cacheada
  const queryResult = useQuery({
    queryKey,
    queryFn: cachedQueryFn,
    staleTime: cacheTTL || 5 * 60 * 1000, // Sincronizar con cache TTL
    ...reactQueryOptions
  })

  // Funciones adicionales para manejo de cache
  const invalidateCache = useCallback(async () => {
    await apiCache.remove(cacheKey)
  }, [apiCache, cacheKey])

  const preloadCache = useCallback(async () => {
    return apiCache.preload(cacheKey, queryFn, cacheTTL)
  }, [apiCache, cacheKey, queryFn, cacheTTL])

  return {
    ...queryResult,
    invalidateCache,
    preloadCache,
    cacheStats: apiCache.stats
  }
}
