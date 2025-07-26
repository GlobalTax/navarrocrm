import { useState, useMemo, useCallback } from 'react'

export interface VirtualPaginationConfig {
  itemHeight: number
  containerHeight?: number
  overscan?: number
  threshold?: number
}

export const useVirtualPagination = <T>(
  items: T[],
  config: VirtualPaginationConfig
) => {
  const {
    itemHeight,
    containerHeight = 400,
    overscan = 5,
    threshold = 50
  } = config

  const [scrollTop, setScrollTop] = useState(0)

  // Usar virtualización solo si hay muchos elementos
  const shouldVirtualize = items.length > threshold

  const visibleRange = useMemo(() => {
    if (!shouldVirtualize) {
      return { start: 0, end: items.length }
    }

    const start = Math.floor(scrollTop / itemHeight)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const end = Math.min(start + visibleCount + overscan, items.length)

    return {
      start: Math.max(0, start - overscan),
      end
    }
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length, shouldVirtualize])

  const visibleItems = useMemo(() => {
    if (!shouldVirtualize) return items
    return items.slice(visibleRange.start, visibleRange.end)
  }, [items, visibleRange, shouldVirtualize])

  const totalHeight = shouldVirtualize ? items.length * itemHeight : 'auto'
  const offsetY = shouldVirtualize ? visibleRange.start * itemHeight : 0

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    shouldVirtualize,
    containerHeight,
    visibleRange
  }
}