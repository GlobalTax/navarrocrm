
import { forwardRef, memo, useCallback, useMemo, useRef, useEffect } from 'react'
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import { Person } from '@/hooks/usePersons'
import { PersonRowOptimized } from './PersonRowOptimized'
import { PersonTableHeader } from './PersonTableHeader'
import { useVirtualizationCleanup } from '@/hooks/performance/useVirtualizationCleanup'
import { useLogger } from '@/hooks/useLogger'

interface VirtualizedPersonsTableProps {
  persons: Person[]
  onEditPerson: (person: Person) => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
}

export const VirtualizedPersonsTable = memo(forwardRef<any, VirtualizedPersonsTableProps>(
  ({ persons, onEditPerson, hasNextPage, isFetchingNextPage, fetchNextPage }, ref) => {
    const logger = useLogger('VirtualizedPersonsTable')
    const listRef = useRef<List>(null)
    const preloadThreshold = 15 // Preload cuando quedan 15 elementos
    const ITEM_HEIGHT = 80
    const CONTAINER_HEIGHT = 600
    
    // Limpieza automática de memoria
    const { forceCleanup } = useVirtualizationCleanup({
      itemCount: persons.length,
      componentName: 'VirtualizedPersonsTable',
      cleanupThreshold: 500,
      memoryCheckInterval: 25000
    })
    
    const itemCount = useMemo(() => 
      hasNextPage ? persons.length + 1 : persons.length, 
      [hasNextPage, persons.length]
    )
    
    const isItemLoaded = useCallback((index: number) => !!persons[index], [persons])
    
    const itemData = useMemo(() => 
      ({ persons, onEditPerson }), 
      [persons, onEditPerson]
    )

    // Optimized load more con throttling
    const loadMoreItems = useCallback(async (startIndex: number, stopIndex: number) => {
      if (!fetchNextPage || isFetchingNextPage) return
      
      // Performance mark para monitoreo
      performance.mark('virtualized-persons-load-start')
      
      // Preload cuando nos acercamos al final
      if (stopIndex >= persons.length - preloadThreshold) {
        logger.info('🔄 Precargando más personas', {
          stopIndex,
          totalLoaded: persons.length,
          preloadThreshold
        })
        
        try {
          await fetchNextPage()
          
          performance.mark('virtualized-persons-load-end')
          performance.measure(
            'virtualized-persons-load',
            'virtualized-persons-load-start',
            'virtualized-persons-load-end'
          )
        } catch (error) {
          logger.error('❌ Error cargando más personas:', error)
          
          // Forzar limpieza en caso de error
          forceCleanup()
        }
      }
    }, [fetchNextPage, isFetchingNextPage, persons.length, preloadThreshold, logger, forceCleanup])

    // Scroll optimization con debouncing
    const handleItemsRendered = useCallback(({ visibleStartIndex, visibleStopIndex }: any) => {
      const buffer = 8 // Buffer de elementos renderizados fuera del viewport
      const startIndex = Math.max(0, visibleStartIndex - buffer)
      const stopIndex = Math.min(itemCount - 1, visibleStopIndex + buffer)
      
      // Trigger preload si es necesario
      if (stopIndex >= persons.length - preloadThreshold && hasNextPage && !isFetchingNextPage) {
        loadMoreItems(startIndex, stopIndex)
      }

      // Log de performance para debugging
      logger.debug('📊 Items renderizados', {
        visibleRange: `${visibleStartIndex}-${visibleStopIndex}`,
        bufferRange: `${startIndex}-${stopIndex}`,
        totalItems: itemCount
      })
    }, [itemCount, persons.length, hasNextPage, isFetchingNextPage, loadMoreItems, preloadThreshold, logger])

    // Error boundary effect
    useEffect(() => {
      const handleError = (event: ErrorEvent) => {
        if (event.filename?.includes('VirtualizedPersonsTable')) {
          logger.error('💥 Error en tabla virtualizada:', event.error)
          forceCleanup()
        }
      }

      window.addEventListener('error', handleError)
      return () => window.removeEventListener('error', handleError)
    }, [logger, forceCleanup])

    // Scroll to top cuando cambian los filtros
    useEffect(() => {
      if (listRef.current) {
        listRef.current.scrollToItem(0, 'start')
      }
    }, [persons.length])

    return (
      <div className="rounded-xl border-0.5 border-black bg-white overflow-hidden shadow-sm">
        <PersonTableHeader />

        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={loadMoreItems}
          threshold={preloadThreshold}
          minimumBatchSize={25} // Cargar en lotes más grandes
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
              height={CONTAINER_HEIGHT}
              width="100%"
              itemCount={itemCount}
              itemSize={ITEM_HEIGHT}
              itemData={itemData}
              onItemsRendered={(props) => {
                onItemsRendered(props)
                handleItemsRendered(props)
              }}
              overscanCount={8} // Optimizado para mejor performance
              useIsScrolling={true} // Mejora performance durante scroll
            >
              {PersonRowOptimized}
            </List>
          )}
        </InfiniteLoader>

        {isFetchingNextPage && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-0.5 border-black border-t-transparent"></div>
              <div className="text-sm text-gray-600">Cargando más personas...</div>
            </div>
          </div>
        )}
      </div>
    )
  }
))

VirtualizedPersonsTable.displayName = 'VirtualizedPersonsTable'
