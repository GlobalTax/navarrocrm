
import { forwardRef, memo, useCallback, useMemo, useRef, useEffect } from 'react'
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import { Person } from '@/hooks/usePersons'
import { PersonRow } from './PersonRow'
import { PersonTableHeader } from './PersonTableHeader'

interface VirtualizedPersonsTableProps {
  persons: Person[]
  onEditPerson: (person: Person) => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
}

export const VirtualizedPersonsTable = memo(forwardRef<any, VirtualizedPersonsTableProps>(
  ({ persons, onEditPerson, hasNextPage, isFetchingNextPage, fetchNextPage }, ref) => {
    const listRef = useRef<List>(null)
    const preloadThreshold = 10 // Preload when 10 items from end
    
    const itemCount = useMemo(() => 
      hasNextPage ? persons.length + 1 : persons.length, 
      [hasNextPage, persons.length]
    )
    
    const isItemLoaded = useCallback((index: number) => !!persons[index], [persons])
    
    const itemData = useMemo(() => 
      ({ persons, onEditPerson }), 
      [persons, onEditPerson]
    )

    // Optimized load more with preloading
    const loadMoreItems = useCallback(async (startIndex: number, stopIndex: number) => {
      if (!fetchNextPage || isFetchingNextPage) return
      
      // Preload when approaching end
      if (stopIndex >= persons.length - preloadThreshold) {
        await fetchNextPage()
      }
    }, [fetchNextPage, isFetchingNextPage, persons.length])

    // Scroll optimization
    const handleItemsRendered = useCallback(({ visibleStartIndex, visibleStopIndex }: any) => {
      const buffer = 5
      const startIndex = Math.max(0, visibleStartIndex - buffer)
      const stopIndex = Math.min(itemCount - 1, visibleStopIndex + buffer)
      
      // Trigger preload if needed
      if (stopIndex >= persons.length - preloadThreshold && hasNextPage && !isFetchingNextPage) {
        loadMoreItems(startIndex, stopIndex)
      }
    }, [itemCount, persons.length, hasNextPage, isFetchingNextPage, loadMoreItems])

    return (
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        <PersonTableHeader />

        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={loadMoreItems}
          threshold={preloadThreshold}
        >
          {({ onItemsRendered, ref: loaderRef }) => (
            <List
              ref={(list) => {
                listRef.current = list
                loaderRef(list)
                if (ref) {
                  if (typeof ref === 'function') {
                    ref(list)
                  } else {
                    ref.current = list
                  }
                }
              }}
              height={600}
              width="100%"
              itemCount={itemCount}
              itemSize={80}
              itemData={itemData}
              onItemsRendered={(props) => {
                onItemsRendered(props)
                handleItemsRendered(props)
              }}
              overscanCount={5} // Keep 5 items rendered outside viewport
            >
              {PersonRow}
            </List>
          )}
        </InfiniteLoader>

        {isFetchingNextPage && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-center">
              <div className="text-sm text-gray-600">Cargando más personas...</div>
            </div>
          </div>
        )}
      </div>
    )
  }
))

VirtualizedPersonsTable.displayName = 'VirtualizedPersonsTable'
