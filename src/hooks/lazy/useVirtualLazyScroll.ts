
import { useState, useEffect, useCallback } from 'react'

export const useVirtualLazyScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 })

  useEffect(() => {
    const start = Math.floor(scrollTop / itemHeight)
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    )

    setVisibleRange({
      start: Math.max(0, start - overscan),
      end
    })
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length])

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  const visibleItems = items.slice(visibleRange.start, visibleRange.end)
  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.start * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    scrollTop,
    visibleRange
  }
}
