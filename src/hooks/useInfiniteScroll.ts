
import { useState, useCallback } from 'react'

export const useInfiniteScroll = <T>(
  fetchData: (page: number) => Promise<T[]>,
  initialPage = 1
) => {
  const [data, setData] = useState<T[]>([])
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

    try {
      const newData = await fetchData(page)
      
      if (newData.length === 0) {
        setHasMore(false)
      } else {
        setData(prev => [...prev, ...newData])
        setPage(prev => prev + 1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [fetchData, page, loading, hasMore])

  const reset = useCallback(() => {
    setData([])
    setPage(initialPage)
    setLoading(false)
    setHasMore(true)
    setError(null)
  }, [initialPage])

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    reset
  }
}
