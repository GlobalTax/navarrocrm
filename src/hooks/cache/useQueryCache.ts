
import { useState, useCallback, useEffect } from 'react'
import { useIntelligentCache } from './useIntelligentCache'

interface QueryCacheOptions {
  ttl?: number
  staleTime?: number
  cacheTime?: number
  refetchOnMount?: boolean
  refetchOnWindowFocus?: boolean
}

// Hook para cache de consultas con invalidación inteligente
export const useQueryCache = <T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: QueryCacheOptions = {}
) => {
  const { get, set, isReady } = useIntelligentCache()
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)

  const {
    ttl = 5 * 60 * 1000, // 5 minutos
    staleTime = 30 * 1000, // 30 segundos
    refetchOnMount = true,
    refetchOnWindowFocus = false
  } = options

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!isReady) return

    setIsLoading(true)
    setError(null)

    try {
      const now = Date.now()
      
      // Si no es refresh forzado y los datos no están stale, usar cache
      if (!forceRefresh && (now - lastFetch) < staleTime) {
        const cached = await get<T>(queryKey)
        if (cached) {
          setData(cached)
          setIsLoading(false)
          return cached
        }
      }

      // Hacer la consulta fresca
      console.log(`🔄 [QueryCache] Fetching fresh data for: ${queryKey}`)
      const result = await queryFn()
      
      // Guardar en cache
      await set(queryKey, result, ttl)
      setData(result)
      setLastFetch(now)
      
      return result
    } catch (err) {
      console.error(`❌ [QueryCache] Error fetching ${queryKey}:`, err)
      setError(err as Error)
      
      // En caso de error, intentar usar datos cacheados aunque sean stale
      const cached = await get<T>(queryKey)
      if (cached) {
        setData(cached)
        console.log(`💾 [QueryCache] Using stale cache for: ${queryKey}`)
      }
    } finally {
      setIsLoading(false)
    }
  }, [queryKey, queryFn, get, set, isReady, ttl, staleTime, lastFetch])

  // Fetch inicial
  useEffect(() => {
    if (refetchOnMount) {
      fetchData()
    }
  }, [fetchData, refetchOnMount])

  // Refetch en focus de ventana
  useEffect(() => {
    if (!refetchOnWindowFocus) return

    const handleFocus = () => {
      const now = Date.now()
      if ((now - lastFetch) > staleTime) {
        fetchData()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnWindowFocus, fetchData, lastFetch, staleTime])

  const invalidate = useCallback(async () => {
    if (!isReady) return
    await fetchData(true)
  }, [fetchData, isReady])

  const prefetch = useCallback(async () => {
    if (!isReady) return
    
    const cached = await get<T>(queryKey)
    if (!cached) {
      await fetchData()
    }
  }, [get, queryKey, fetchData, isReady])

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchData(true),
    invalidate,
    prefetch,
    isStale: (Date.now() - lastFetch) > staleTime
  }
}
