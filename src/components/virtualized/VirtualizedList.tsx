
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

interface VirtualizedListProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
  onEndReached?: () => void
  onEndReachedThreshold?: number
  loading?: boolean
  emptyState?: React.ReactNode
}

export function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
  onEndReached,
  onEndReachedThreshold = 0.8,
  loading = false,
  emptyState
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(false)

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  // Detectar cuando estamos cerca del final
  useEffect(() => {
    if (!onEndReached || !parentRef.current) return

    const handleScroll = () => {
      const element = parentRef.current
      if (!element) return

      const { scrollTop, scrollHeight, clientHeight } = element
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

      if (scrollPercentage >= onEndReachedThreshold && !isAtBottom) {
        setIsAtBottom(true)
        onEndReached()
      } else if (scrollPercentage < onEndReachedThreshold) {
        setIsAtBottom(false)
      }
    }

    const element = parentRef.current
    element.addEventListener('scroll', handleScroll, { passive: true })
    return () => element.removeEventListener('scroll', handleScroll)
  }, [onEndReached, onEndReachedThreshold, isAtBottom])

  // Estado vacío
  if (items.length === 0 && !loading) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        {emptyState || (
          <div className="text-center text-gray-500">
            <p>No hay elementos para mostrar</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>

      {/* Loading indicator al final */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  )
}
