
import { useCallback, useRef } from 'react'
import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { useOptimizedAPICache } from './useOptimizedAPICache'

interface QueryCacheOptions<T> {
  ttl?: number
  priority?: 'low' | 'medium' | 'high'
  staleTime?: number
  refetchOnMount?: boolean
  refetchOnWindowFocus?: boolean
  refetchOnReconnect?: boolean
  enableCaching?: boolean
  preload?: boolean
}

export const useQueryCache = <T>(
  queryKey: string | string[],
  queryFn: () => Promise<T>,
  options: QueryCacheOptions<T> = {}
) => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutos
    priority = 'medium',
    staleTime = 2 * 60 * 1000, // 2 minutos
    refetchOnMount = false,
    refetchOnWindowFocus = false,
    refetchOnReconnect = true,
    enableCaching = true,
    preload = false
  } = options

  const queryClient = useQueryClient()
  const apiCache = useOptimizedAPICache()
  const preloadedRef = useRef(false)

  // Normalizar query key
  const normalizedKey = Array.isArray(queryKey) ? queryKey.join('-') : queryKey
  const cacheKey = `query-${normalizedKey}`

  // Función de consulta optimizada con cache
  const optimizedQueryFn = useCallback(async (): Promise<T> => {
    if (enableCaching && apiCache.isReady) {
      return apiCache.fetchWithCache(cacheKey, queryFn, {
        ttl,
        priority
      })
    }
    
    // Fallback sin cache
    return queryFn()
  }, [apiCache, cacheKey, queryFn, ttl, priority, enableCaching])

  // Configuración de react-query
  const queryConfig: UseQueryOptions<T> = {
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: optimizedQueryFn,
    staleTime,
    refetchOnMount,
    refetchOnWindowFocus,
    refetchOnReconnect,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  }

  const query = useQuery(queryConfig)

  // Precargar datos si está habilitado
  if (preload && !preloadedRef.current && apiCache.isReady) {
    preloadedRef.current = true
    apiCache.preloadData(cacheKey, queryFn, priority)
  }

  // Función para invalidar cache
  const invalidate = useCallback(async () => {
    // Invalidar en react-query
    await queryClient.invalidateQueries({ 
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] 
    })
    
    // Invalidar en cache híbrido
    if (enableCaching) {
      await apiCache.invalidateKey(cacheKey)
    }
  }, [queryClient, queryKey, apiCache, cacheKey, enableCaching])

  // Función para refetch forzado
  const refetchWithoutCache = useCallback(async () => {
    // Invalidar cache primero
    if (enableCaching) {
      await apiCache.invalidateKey(cacheKey)
    }
    
    // Refetch
    return query.refetch()
  }, [apiCache, cacheKey, query, enableCaching])

  return {
    ...query,
    invalidate,
    refetchWithoutCache,
    cacheStats: apiCache.getMetrics()
  }
}
