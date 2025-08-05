import { useMemo, useCallback, useState } from 'react'
import { useVirtualPagination, VirtualPaginationConfig } from './useVirtualPagination'
import { useOptimizedMemo } from './useOptimizedMemo'
import { usePerformanceMonitor } from './performance/usePerformanceMonitor'

export interface TableColumn<T> {
  key: string
  header: string
  accessor: keyof T | ((item: T) => any)
  width?: string | number
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, item: T, index: number) => React.ReactNode
}

export interface VirtualTableConfig<T> extends VirtualPaginationConfig {
  columns: TableColumn<T>[]
  data: T[]
  keyExtractor: (item: T, index: number) => string
  onRowClick?: (item: T, index: number) => void
  onRowSelect?: (item: T, selected: boolean) => void
  selectedRows?: Set<string>
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  enableBulkOperations?: boolean
}

export const useVirtualTable = <T>(config: VirtualTableConfig<T>) => {
  const { 
    columns, 
    data, 
    keyExtractor, 
    selectedRows = new Set(),
    sortBy,
    sortDirection = 'asc',
    onSort,
    enableBulkOperations = false,
    ...virtualConfig 
  } = config

  const { metrics } = usePerformanceMonitor(`VirtualTable-${data.length}items`)
  const [searchTerm, setSearchTerm] = useState('')

  // Memoize filtered and sorted data
  const processedData = useOptimizedMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchTerm) {
      filtered = data.filter(item => {
        return columns.some(column => {
          const value = typeof column.accessor === 'function' 
            ? column.accessor(item)
            : item[column.accessor]
          return String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      })
    }

    // Apply sorting
    if (sortBy && onSort) {
      const column = columns.find(col => col.key === sortBy)
      if (column) {
        filtered = [...filtered].sort((a, b) => {
          const aValue = typeof column.accessor === 'function' 
            ? column.accessor(a)
            : a[column.accessor]
          const bValue = typeof column.accessor === 'function' 
            ? column.accessor(b)
            : b[column.accessor]

          if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
          if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
          return 0
        })
      }
    }

    return filtered
  }, [data, searchTerm, sortBy, sortDirection, columns], `VirtualTable-processedData`)

  // Virtual pagination for large datasets
  const virtualization = useVirtualPagination(processedData, virtualConfig)

  // Bulk selection handlers
  const isAllSelected = useMemo(() => 
    processedData.length > 0 && processedData.every(item => 
      selectedRows.has(keyExtractor(item, 0))
    ), [processedData, selectedRows, keyExtractor]
  )

  const isIndeterminate = useMemo(() => 
    !isAllSelected && processedData.some(item => 
      selectedRows.has(keyExtractor(item, 0))
    ), [processedData, selectedRows, keyExtractor, isAllSelected]
  )

  const handleSelectAll = useCallback((selected: boolean) => {
    if (!config.onRowSelect) return
    
    processedData.forEach(item => {
      config.onRowSelect!(item, selected)
    })
  }, [processedData, config.onRowSelect])

  const handleSort = useCallback((columnKey: string) => {
    if (!onSort) return
    
    const newDirection = sortBy === columnKey && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(columnKey, newDirection)
  }, [sortBy, sortDirection, onSort])

  // Performance stats
  const stats = useMemo(() => ({
    totalItems: data.length,
    filteredItems: processedData.length,
    selectedItems: selectedRows.size,
    renderItems: virtualization.visibleItems.length,
    isVirtualized: virtualization.shouldVirtualize
  }), [data.length, processedData.length, selectedRows.size, virtualization.visibleItems.length, virtualization.shouldVirtualize])

  return {
    // Data
    processedData,
    visibleItems: virtualization.visibleItems,
    
    // Virtual scrolling
    ...virtualization,
    
    // Selection
    selectedRows,
    isAllSelected,
    isIndeterminate,
    handleSelectAll,
    
    // Sorting
    sortBy,
    sortDirection,
    handleSort,
    
    // Search
    searchTerm,
    setSearchTerm,
    
    // Stats & Performance
    stats,
    metrics,
    
    // Configuration
    columns,
    keyExtractor,
    enableBulkOperations
  }
}