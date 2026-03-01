
import React, { useRef, useCallback, useEffect } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ColumnDef<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  width?: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  visible?: boolean
}

interface ParametricTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  onRowClick?: (item: T) => void
  isLoading?: boolean
  emptyMessage?: string
  maxHeight?: number
  // Infinite scroll
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
  // Sorting
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (columnKey: string) => void
}

export function ParametricTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading,
  emptyMessage = 'No hay datos',
  maxHeight = 600,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  sortBy,
  sortDirection,
  onSort,
}: ParametricTableProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLTableRowElement>(null)

  const visibleColumns = columns.filter(col => col.visible !== false)

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!hasNextPage || !fetchNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage()
        }
      },
      { root: scrollRef.current, threshold: 0.1 }
    )

    const sentinel = sentinelRef.current
    if (sentinel) observer.observe(sentinel)

    return () => {
      if (sentinel) observer.unobserve(sentinel)
    }
  }, [hasNextPage, fetchNextPage, isFetchingNextPage, data.length])

  const handleSort = useCallback(
    (key: string) => {
      if (onSort) onSort(key)
    },
    [onSort]
  )

  const getSortIcon = (key: string) => {
    if (sortBy !== key) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    )
  }

  const alignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center'
    if (align === 'right') return 'text-right'
    return 'text-left'
  }

  return (
    <div className="rounded-[10px] border-[0.5px] border-black/80 bg-white overflow-hidden shadow-sm">
      {/* Fixed header */}
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-black/10">
            {visibleColumns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  'font-semibold text-foreground text-xs uppercase tracking-wide',
                  alignClass(col.align),
                  col.sortable && 'cursor-pointer select-none hover:text-primary'
                )}
                style={col.width ? { width: col.width } : undefined}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1.5">
                  {col.header}
                  {col.sortable && getSortIcon(col.key)}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      </Table>

      {/* Scrollable body */}
      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        <Table>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={keyExtractor(item)}
                className={cn(
                  'border-b border-black/5 transition-all duration-200 group',
                  onRowClick && 'cursor-pointer hover:bg-muted/30 hover:-translate-y-[1px] hover:shadow-sm'
                )}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {visibleColumns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn('py-3 px-4', alignClass(col.align))}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    {col.render(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {/* Sentinel for infinite scroll */}
            {hasNextPage && (
              <tr ref={sentinelRef}>
                <td colSpan={visibleColumns.length} className="p-0 h-1" />
              </tr>
            )}

            {/* Loading row */}
            {isFetchingNextPage && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={visibleColumns.length}
                  className="text-center py-4 text-sm text-muted-foreground"
                >
                  Cargando más datos...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
