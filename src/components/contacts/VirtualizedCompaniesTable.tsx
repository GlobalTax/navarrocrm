
import { forwardRef, memo, useCallback, useMemo, useRef, useEffect } from 'react'
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import { Company } from '@/hooks/useCompanies'
import { CompanyRowOptimized } from './CompanyRowOptimized'
import { useVirtualizationCleanup } from '@/hooks/performance/useVirtualizationCleanup'
import { useLogger } from '@/hooks/useLogger'

interface VirtualizedCompaniesTableProps {
  companies: Company[]
  onEditCompany: (company: Company) => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
}

export const VirtualizedCompaniesTable = memo(forwardRef<any, VirtualizedCompaniesTableProps>(
  ({ companies, onEditCompany, hasNextPage, isFetchingNextPage, fetchNextPage }, ref) => {
    const logger = useLogger('VirtualizedCompaniesTable')
    const listRef = useRef<List>(null)
    const preloadThreshold = 12 // Preload threshold más agresivo para empresas
    const ITEM_HEIGHT = 80
    const CONTAINER_HEIGHT = 600
    
    // Limpieza automática de memoria para empresas
    const { forceCleanup } = useVirtualizationCleanup({
      itemCount: companies.length,
      componentName: 'VirtualizedCompaniesTable',
      cleanupThreshold: 300, // Threshold más bajo para empresas (datos más complejos)
      memoryCheckInterval: 20000
    })
    
    const itemCount = useMemo(() => 
      hasNextPage ? companies.length + 1 : companies.length, 
      [hasNextPage, companies.length]
    )
    
    const isItemLoaded = useCallback((index: number) => !!companies[index], [companies])
    
    const itemData = useMemo(() => 
      ({ companies, onEditCompany }), 
      [companies, onEditCompany]
    )

    // Load more optimizado para empresas
    const loadMoreItems = useCallback(async (startIndex: number, stopIndex: number) => {
      if (!fetchNextPage || isFetchingNextPage) return
      
      performance.mark('virtualized-companies-load-start')
      
      if (stopIndex >= companies.length - preloadThreshold) {
        logger.info('🏢 Precargando más empresas', {
          stopIndex,
          totalLoaded: companies.length,
          preloadThreshold
        })
        
        try {
          await fetchNextPage()
          
          performance.mark('virtualized-companies-load-end')
          performance.measure(
            'virtualized-companies-load',
            'virtualized-companies-load-start',
            'virtualized-companies-load-end'
          )
        } catch (error) {
          logger.error('❌ Error cargando más empresas:', error)
          forceCleanup()
        }
      }
    }, [fetchNextPage, isFetchingNextPage, companies.length, preloadThreshold, logger, forceCleanup])

    const handleItemsRendered = useCallback(({ visibleStartIndex, visibleStopIndex }: any) => {
      const buffer = 6 // Buffer más pequeño para empresas
      const startIndex = Math.max(0, visibleStartIndex - buffer)
      const stopIndex = Math.min(itemCount - 1, visibleStopIndex + buffer)
      
      if (stopIndex >= companies.length - preloadThreshold && hasNextPage && !isFetchingNextPage) {
        loadMoreItems(startIndex, stopIndex)
      }

      logger.debug('🏢 Empresas renderizadas', {
        visibleRange: `${visibleStartIndex}-${visibleStopIndex}`,
        bufferRange: `${startIndex}-${stopIndex}`,
        totalItems: itemCount
      })
    }, [itemCount, companies.length, hasNextPage, isFetchingNextPage, loadMoreItems, preloadThreshold, logger])

    // Error handling específico para empresas
    useEffect(() => {
      const handleError = (event: ErrorEvent) => {
        if (event.filename?.includes('VirtualizedCompaniesTable')) {
          logger.error('💥 Error en tabla de empresas:', event.error)
          forceCleanup()
        }
      }

      window.addEventListener('error', handleError)
      return () => window.removeEventListener('error', handleError)
    }, [logger, forceCleanup])

    // Reset scroll en cambios de filtro
    useEffect(() => {
      if (listRef.current) {
        listRef.current.scrollToItem(0, 'start')
      }
    }, [companies.length])

    return (
      <div className="rounded-xl border-0.5 border-black bg-white overflow-hidden shadow-sm">
        {/* Header optimizado para empresas */}
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div className="grid grid-cols-7 gap-4">
            <div className="font-semibold text-gray-900 text-sm">Empresa</div>
            <div className="font-semibold text-gray-900 text-sm">Sector</div>
            <div className="font-semibold text-gray-900 text-sm">Contacto Principal</div>
            <div className="font-semibold text-gray-900 text-sm">Información</div>
            <div className="font-semibold text-gray-900 text-sm">Contactos</div>
            <div className="font-semibold text-gray-900 text-sm">Estado</div>
            <div className="font-semibold text-gray-900 text-sm text-right">Acciones</div>
          </div>
        </div>

        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={loadMoreItems}
          threshold={preloadThreshold}
          minimumBatchSize={20} // Lotes más pequeños para empresas
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
              overscanCount={6} // Overscan optimizado para empresas
              useIsScrolling={true}
            >
              {CompanyRowOptimized}
            </List>
          )}
        </InfiniteLoader>

        {isFetchingNextPage && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-0.5 border-black border-t-transparent"></div>
              <div className="text-sm text-gray-600">Cargando más empresas...</div>
            </div>
          </div>
        )}
      </div>
    )
  }
))

VirtualizedCompaniesTable.displayName = 'VirtualizedCompaniesTable'
