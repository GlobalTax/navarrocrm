import React, { memo, useMemo } from 'react'
import { VirtualList } from './VirtualList'
import { LazyRenderComponent } from './LazyRenderComponent'
import { useSmartMemo } from '@/hooks/performance/useSmartMemo'
import { useLogger } from '@/hooks/useLogger'

interface OptimizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight?: number
  height?: number
  className?: string
  onLoadMore?: () => void
  hasNextPage?: boolean
  isLoading?: boolean
  getItemKey?: (item: T, index: number) => string | number
  enableVirtualization?: boolean
  enableLazyRender?: boolean
  threshold?: number
  searchTerm?: string
  sortBy?: string
  filterFn?: (item: T) => boolean
}

// Memoized item renderer wrapper
const MemoizedItemWrapper = memo<{
  item: any
  index: number
  renderItem: (item: any, index: number) => React.ReactNode
  getItemKey?: (item: any, index: number) => string | number
}>(({ item, index, renderItem, getItemKey }) => {
  const key = getItemKey ? getItemKey(item, index) : index
  return (
    <div key={key} data-testid={`list-item-${key}`}>
      {renderItem(item, index)}
    </div>
  )
})

MemoizedItemWrapper.displayName = 'MemoizedItemWrapper'

export function OptimizedList<T>({
  items,
  renderItem,
  itemHeight = 80,
  height = 400,
  className = '',
  onLoadMore,
  hasNextPage = false,
  isLoading = false,
  getItemKey,
  enableVirtualization = true,
  enableLazyRender = true,
  threshold = 0.1,
  searchTerm = '',
  sortBy = '',
  filterFn
}: OptimizedListProps<T>) {
  const logger = useLogger('OptimizedList')

  // Smart memoization for filtered and sorted items
  const processedItems = useSmartMemo(
    () => {
      let result = [...items]

      // Apply filter function if provided
      if (filterFn) {
        result = result.filter(filterFn)
      }

      // Apply search filter if searchTerm is provided
      if (searchTerm) {
        result = result.filter(item => {
          const searchableText = JSON.stringify(item).toLowerCase()
          return searchableText.includes(searchTerm.toLowerCase())
        })
      }

      // Apply sorting if sortBy is provided
      if (sortBy) {
        result.sort((a, b) => {
          const aValue = (a as any)[sortBy]
          const bValue = (b as any)[sortBy]
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return aValue.localeCompare(bValue)
          }
          
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        })
      }

      logger.info('📊 Lista procesada', {
        originalCount: items.length,
        filteredCount: result.length,
        searchTerm: searchTerm || 'none',
        sortBy: sortBy || 'none'
      })

      return result
    },
    [items, searchTerm, sortBy, filterFn],
    {
      key: `optimized-list-${searchTerm}-${sortBy}`,
      ttl: 30000 // 30 seconds
    }
  )

  // Memoized render function
  const memoizedRenderItem = useMemo(
    () => (item: T, index: number) => (
      <MemoizedItemWrapper
        item={item}
        index={index}
        renderItem={renderItem}
        getItemKey={getItemKey}
      />
    ),
    [renderItem, getItemKey]
  )

  // Render virtual list if enabled and items are numerous
  if (enableVirtualization && processedItems.length > 50) {
    const content = (
      <VirtualList
        items={processedItems}
        renderItem={memoizedRenderItem}
        itemHeight={itemHeight}
        height={height}
        className={className}
        onLoadMore={onLoadMore}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        getItemKey={getItemKey}
      />
    )

    if (enableLazyRender) {
      return (
        <LazyRenderComponent 
          threshold={threshold}
          minHeight={height}
          className={className}
        >
          {content}
        </LazyRenderComponent>
      )
    }

    return content
  }

  // Regular list for smaller datasets
  const regularList = (
    <div 
      className={`overflow-auto border-0.5 border-black rounded-[10px] ${className}`}
      style={{ height }}
    >
      <div className="space-y-2 p-2">
        {processedItems.map((item, index) => 
          memoizedRenderItem(item, index)
        )}
        
        {hasNextPage && onLoadMore && (
          <div className="flex justify-center py-4">
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-0.5 border-black border-t-transparent" />
            ) : (
              <button
                onClick={onLoadMore}
                className="px-4 py-2 border-0.5 border-black rounded-[10px] hover:transform hover:translateY(-1px) transition-transform duration-200"
              >
                Cargar más
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (enableLazyRender) {
    return (
      <LazyRenderComponent 
        threshold={threshold}
        minHeight={height}
        className={className}
      >
        {regularList}
      </LazyRenderComponent>
    )
  }

  return regularList
}