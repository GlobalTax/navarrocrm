
import { useState, useEffect, useCallback, useRef } from 'react'
import { DatabaseOptimizer, QueryOptions, QueryResult } from '@/services/database/DatabaseOptimizer'
import { useQueryCache } from '@/hooks/cache/useQueryCache'

export const useOptimizedQuery = <T>(
  table: string,
  options: QueryOptions = {}
) => {
  const [result, setResult] = useState<QueryResult<T>>({
    data: [],
    count: 0,
    page: 1,
    totalPages: 0,
    hasMore: false,
    isLoading: true,
    error: null
  })

  const optimizer = DatabaseOptimizer.getInstance()
  const abortControllerRef = useRef<AbortController | null>(null)

  // Usar el sistema de cache existente
  const cacheKey = `optimized-query-${table}-${JSON.stringify(options)}`
  
  const { data: cachedResult, invalidate } = useQueryCache(
    cacheKey,
    () => optimizer.executeQuery<T>(table, options),
    {
      ttl: options.cacheTime || 5 * 60 * 1000,
      staleTime: 30 * 1000,
      refetchOnMount: true
    }
  )

  useEffect(() => {
    if (cachedResult) {
      setResult(cachedResult)
    }
  }, [cachedResult])

  const refetch = useCallback(async () => {
    await invalidate()
  }, [invalidate])

  const loadMore = useCallback(async () => {
    if (!result.hasMore || result.isLoading) return

    const nextPage = result.page + 1
    const nextOptions = { ...options, page: nextPage }

    setResult(prev => ({ ...prev, isLoading: true }))

    try {
      const nextResult = await optimizer.executeQuery<T>(table, nextOptions)
      
      setResult(prev => ({
        ...nextResult,
        data: [...prev.data, ...nextResult.data],
        isLoading: false
      }))
    } catch (error) {
      setResult(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error
      }))
    }
  }, [table, options, result.hasMore, result.isLoading, result.page, optimizer])

  return {
    ...result,
    refetch,
    loadMore
  }
}
