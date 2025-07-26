import React from 'react'
import { useVirtualPagination, VirtualPaginationConfig } from '@/hooks/useVirtualPagination'

interface VirtualListProps<T> extends VirtualPaginationConfig {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  emptyState?: React.ReactNode
}

export function VirtualList<T>({
  items,
  renderItem,
  className = '',
  emptyState,
  ...config
}: VirtualListProps<T>) {
  const {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    shouldVirtualize,
    containerHeight,
    visibleRange
  } = useVirtualPagination(items, config)

  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  if (!shouldVirtualize) {
    return (
      <div className={className}>
        {items.map((item, index) => renderItem(item, index))}
      </div>
    )
  }

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={visibleRange.start + index}>
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}