import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useIntersectionObserver } from '@/hooks/performance/useIntersectionObserver'
import { useLogger } from '@/hooks/useLogger'

interface VirtualListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight?: number
  height?: number
  overscan?: number
  className?: string
  onLoadMore?: () => void
  hasNextPage?: boolean
  isLoading?: boolean
  getItemKey?: (item: T, index: number) => string | number
}

export function VirtualList<T>({
  items,
  renderItem,
  itemHeight = 80,
  height = 400,
  overscan = 5,
  className = '',
  onLoadMore,
  hasNextPage = false,
  isLoading = false,
  getItemKey
}: VirtualListProps<T>) {
  const logger = useLogger('VirtualList')
  const parentRef = useRef<HTMLDivElement>(null)
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null)

  // Virtual scrolling
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => itemHeight,
    overscan
  })

  // Intersection observer for infinite loading
  const { targetRef: loadMoreRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  })

  // Load more when sentinel is visible
  useEffect(() => {
    if (isIntersecting && hasNextPage && !isLoading && onLoadMore) {
      logger.info('🔄 Cargando más elementos', { 
        currentCount: items.length,
        hasNextPage,
        isLoading 
      })
      onLoadMore()
    }
  }, [isIntersecting, hasNextPage, isLoading, onLoadMore, items.length, logger])

  // Memoize virtual items to prevent unnecessary re-renders
  const virtualItems = useMemo(() => 
    virtualizer.getVirtualItems(),
    [virtualizer.getVirtualItems()]
  )

  useEffect(() => {
    if (parentRef.current) {
      setScrollElement(parentRef.current)
    }
  }, [])

  // Performance logging
  useEffect(() => {
    logger.info('📊 VirtualList stats', {
      totalItems: items.length,
      visibleItems: virtualItems.length,
      itemHeight,
      overscan
    })
  }, [items.length, virtualItems.length, itemHeight, overscan, logger])

  return (
    <div
      ref={parentRef}
      className={`overflow-auto border-0.5 border-black rounded-[10px] ${className}`}
      style={{ height }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative'
        }}
      >
        {virtualItems.map((virtualRow) => {
          const item = items[virtualRow.index]
          const key = getItemKey ? getItemKey(item, virtualRow.index) : virtualRow.index

          return (
            <div
              key={key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          )
        })}

        {/* Infinite loading sentinel */}
        {hasNextPage && (
          <div
            ref={loadMoreRef}
            style={{
              position: 'absolute',
              top: `${virtualizer.getTotalSize() - 100}px`,
              height: '100px',
              width: '100%'
            }}
          >
            {isLoading && (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-0.5 border-black border-t-transparent" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}