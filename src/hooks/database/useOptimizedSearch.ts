
import { useState, useEffect, useCallback, useRef } from 'react'
import { DatabaseOptimizer, QueryOptions, QueryResult } from '@/services/database/DatabaseOptimizer'

export const useOptimizedSearch = <T>(
  table: string,
  searchTerm: string,
  searchColumns: string[],
  options: QueryOptions = {}
) => {
  const [result, setResult] = useState<QueryResult<T>>({
    data: [],
    count: 0,
    page: 1,
    totalPages: 0,
    hasMore: false,
    isLoading: false,
    error: null
  })

  const optimizer = DatabaseOptimizer.getInstance()
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const search = useCallback(async () => {
    if (!searchTerm.trim()) {
      setResult(prev => ({ 
        ...prev, 
        data: [], 
        count: 0, 
        isLoading: false,
        totalPages: 0,
        hasMore: false
      }))
      return
    }

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setResult(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        const searchResult = await optimizer.searchQuery<T>(
          table,
          searchTerm,
          searchColumns,
          options
        )

        setResult(searchResult)
      } catch (error) {
        setResult(prev => ({
          ...prev,
          isLoading: false,
          error: error as Error
        }))
      }
    }, 300)
  }, [table, searchTerm, searchColumns, JSON.stringify(options)])

  useEffect(() => {
    search()

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [search])

  return result
}
