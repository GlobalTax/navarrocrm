
import { useState, useEffect, useCallback } from 'react'
import { DatabaseOptimizer, QueryOptions, QueryResult } from '@/services/database/DatabaseOptimizer'
import { useQueryCache } from '@/hooks/cache/useQueryCache'

export const useOptimizedQueryWithRelations = <T>(
  table: string,
  relations: string[],
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

  // Usar cache con clave específica para relaciones
  const cacheKey = `optimized-relations-${table}-${relations.join('-')}-${JSON.stringify(options)}`
  
  const { data: cachedResult, invalidate } = useQueryCache(
    cacheKey,
    () => optimizer.queryWithRelations<T>(table, relations, options),
    {
      ttl: options.cacheTime || 3 * 60 * 1000, // Relaciones más cortas por complejidad
      staleTime: 60 * 1000,
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

  return {
    ...result,
    refetch
  }
}
