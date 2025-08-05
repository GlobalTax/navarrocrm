import React from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal,
  Loader2 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVirtualTable, TableColumn } from '@/hooks/useVirtualTable'
import { useBulkOperations, BulkOperation } from '@/hooks/useBulkOperations'
import { tableOptimizations } from '@/utils/tableOptimizations'

interface OptimizedVirtualTableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  keyExtractor: (item: T, index: number) => string
  onRowClick?: (item: T, index: number) => void
  onRowSelect?: (item: T, selected: boolean) => void
  selectedRows?: Set<string>
  bulkOperations?: BulkOperation<T>[]
  className?: string
  containerHeight?: number
  itemHeight?: number
  searchPlaceholder?: string
  enableSearch?: boolean
  enableBulkOperations?: boolean
  emptyState?: React.ReactNode
  loadingState?: React.ReactNode
  isLoading?: boolean
}

export function OptimizedVirtualTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  onRowSelect,
  selectedRows = new Set(),
  bulkOperations = [],
  className,
  containerHeight = 600,
  itemHeight,
  searchPlaceholder = "Buscar...",
  enableSearch = true,
  enableBulkOperations = false,
  emptyState,
  loadingState,
  isLoading = false
}: OptimizedVirtualTableProps<T>) {

  // Calculate optimal item height if not provided
  const optimizedItemHeight = itemHeight || tableOptimizations.calculateOptimalRowHeight(
    columns.some(col => col.key.includes('avatar') || col.key.includes('image')),
    columns.some(col => col.key.includes('description') || col.key.includes('notes'))
  )

  // Virtual table hook
  const tableConfig = useVirtualTable({
    columns,
    data,
    keyExtractor,
    selectedRows,
    onRowSelect,
    itemHeight: optimizedItemHeight,
    containerHeight,
    threshold: tableOptimizations.getVirtualizationThreshold(),
    enableBulkOperations
  })

  // Bulk operations hook
  const selectedItems = data.filter(item => 
    selectedRows.has(keyExtractor(item, 0))
  )

  const bulkConfig = useBulkOperations({
    operations: bulkOperations,
    selectedItems,
    onSelectionChange: (items) => {
      items.forEach(item => onRowSelect?.(item, true))
    }
  })

  // Render loading state
  if (isLoading) {
    return (
      <div className={cn("rounded-xl border border-gray-100 bg-white", className)}>
        {loadingState || (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Cargando datos...</span>
          </div>
        )}
      </div>
    )
  }

  // Render empty state
  if (data.length === 0) {
    return (
      <div className={cn("rounded-xl border border-gray-100 bg-white", className)}>
        {emptyState || (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-lg font-medium">No hay datos disponibles</p>
            <p className="text-sm mt-1">Los elementos aparecerán aquí cuando estén disponibles</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("rounded-xl border border-gray-100 bg-white overflow-hidden", className)}>
      {/* Header with search and bulk operations */}
      {(enableSearch || enableBulkOperations) && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            {enableSearch && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={searchPlaceholder}
                  value={tableConfig.searchTerm}
                  onChange={(e) => tableConfig.setSearchTerm(e.target.value)}
                  className="pl-10 border-0.5 border-black rounded-[10px]"
                />
              </div>
            )}

            {enableBulkOperations && selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-0.5 border-black rounded-[10px]">
                  {selectedItems.length} seleccionados
                </Badge>
                {bulkConfig.availableOperations.map(operation => (
                  <Button
                    key={operation.id}
                    variant={operation.destructive ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => bulkConfig.executeOperation(operation.id)}
                    disabled={bulkConfig.isExecuting}
                    className="border-0.5 border-black rounded-[10px] hover-lift"
                  >
                    {operation.icon && <operation.icon className="h-4 w-4 mr-2" />}
                    {operation.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Performance stats in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-700">
          📊 Items: {tableConfig.stats.totalItems} | 
          Filtered: {tableConfig.stats.filteredItems} | 
          Rendered: {tableConfig.stats.renderItems} | 
          Virtualized: {tableConfig.stats.isVirtualized ? 'Yes' : 'No'}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100 hover:bg-transparent">
              {enableBulkOperations && (
                <TableHead className="w-12 py-4 px-6">
                  <Checkbox
                    checked={tableConfig.isAllSelected}
                    onCheckedChange={tableConfig.handleSelectAll}
                    {...(tableConfig.isIndeterminate && { 'data-indeterminate': true })}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  className="font-semibold text-gray-900 py-4 px-6"
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => tableConfig.handleSort(column.key)}
                      className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent"
                    >
                      {column.header}
                      {tableConfig.sortBy === column.key && (
                        tableConfig.sortDirection === 'asc' 
                          ? <ChevronUp className="ml-1 h-4 w-4" />
                          : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>

        {/* Virtualized Content */}
        <div
          className="overflow-auto"
          style={{ height: tableConfig.containerHeight }}
          onScroll={tableConfig.handleScroll}
        >
          <div style={{ height: tableConfig.totalHeight, position: 'relative' }}>
            <div
              style={{
                transform: `translateY(${tableConfig.offsetY}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0
              }}
            >
              <Table>
                <TableBody>
                  {tableConfig.visibleItems.map((item, index) => {
                    const itemKey = keyExtractor(item, tableConfig.visibleRange.start + index)
                    const isSelected = selectedRows.has(itemKey)
                    
                    return (
                      <TableRow 
                        key={itemKey}
                        className={cn(
                          "border-gray-50 hover:bg-gray-25 transition-colors duration-150 group cursor-pointer",
                          isSelected && "bg-blue-50 hover:bg-blue-100"
                        )}
                        onClick={() => onRowClick?.(item, tableConfig.visibleRange.start + index)}
                      >
                        {enableBulkOperations && (
                          <TableCell className="py-4 px-6">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => onRowSelect?.(item, !!checked)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                        )}
                        {columns.map((column) => {
                          const value = typeof column.accessor === 'function' 
                            ? column.accessor(item)
                            : item[column.accessor]
                          
                          return (
                            <TableCell 
                              key={column.key}
                              className="py-4 px-6"
                              style={{ width: column.width }}
                            >
                              {column.render ? column.render(value, item, index) : String(value)}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with pagination info */}
      {tableConfig.stats.filteredItems > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Mostrando {tableConfig.visibleRange.start + 1}-{Math.min(tableConfig.visibleRange.end, tableConfig.stats.filteredItems)} de {tableConfig.stats.filteredItems}
            </span>
            {tableConfig.stats.isVirtualized && (
              <span className="text-xs text-blue-600">
                Virtualizado para mejor rendimiento
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}