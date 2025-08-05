// Optimized table components for high-performance data rendering
export { OptimizedVirtualTable } from './OptimizedVirtualTable'
export { OptimizedCaseTable } from './OptimizedCaseTable'
export { OptimizedTimeTrackingTable } from './OptimizedTimeTrackingTable'

// Re-export hooks for convenience
export { useVirtualTable } from '@/hooks/useVirtualTable'
export { useBulkOperations } from '@/hooks/useBulkOperations'

// Re-export types
export type { TableColumn } from '@/hooks/useVirtualTable'
export type { BulkOperation } from '@/hooks/useBulkOperations'