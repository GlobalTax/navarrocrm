
import { useState, useCallback } from 'react'

export const useInfiniteLazyScroll = <T>(
  fetchData: (page: number) => Promise<T[]>,
  pageSize: number = 20
) => {
  const [data, setData] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    setError(null)

    try {
      const newData = await fetchData(page)
      
      if (newData.length < pageSize) {
        setHasMore(false)
      }

      setData(prev => [...prev, ...newData])
      setPage(prev => prev + 1)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchData, page, pageSize, isLoading, hasMore])

  const reset = useCallback(() => {
    setData([])
    setPage(1)
    setHasMore(true)
    setError(null)
  }, [])

  return {
    data,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset
  }
}
