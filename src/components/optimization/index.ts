// Phase 5: Rendering optimization exports
export { VirtualList } from './VirtualList'
export { LazyRenderComponent } from './LazyRenderComponent'
export { OptimizedList } from './OptimizedList'

// Phase 1: Critical High-Volume Components
export { VirtualizedCaseTable } from '../cases/VirtualizedCaseTable'
export { VirtualizedTasksList } from '../tasks/VirtualizedTasksList'
export { VirtualizedUserTable } from '../users/VirtualizedUserTable'
export { VirtualizedContactTableLegacy } from '../contacts/VirtualizedContactTableLegacy'
export { SmartVirtualizedTable } from './SmartVirtualizedTable'

// Performance hooks
export { useVirtualizedData, VIRTUALIZATION_CONFIG } from '../../hooks/performance/useVirtualizedData'

// Phase 6: Cache and persistence
export { default as OfflineIndicator } from './OfflineIndicator'

// Legacy exports
export { LazyRouteWrapper } from './LazyRouteWrapper'

// Phase 2: Improved existing components
export { VirtualizedPersonsTable } from '../contacts/VirtualizedPersonsTable'
export { VirtualizedCompaniesTable } from '../contacts/VirtualizedCompaniesTable'
export { PersonRowOptimized } from '../contacts/PersonRowOptimized'
export { CompanyRowOptimized } from '../contacts/CompanyRowOptimized'

// Phase 2: Performance hooks
export { useVirtualizationCleanup } from '../../hooks/performance/useVirtualizationCleanup'

// Phase 3: Specialized Components
export { VirtualizedAIUsageTable } from '../admin/VirtualizedAIUsageTable'
export { VirtualizedContactCardView } from '../contacts/VirtualizedContactCardView'

// Phase 3: Specialized hooks
export { useImageLazyLoading } from '../../hooks/performance/useImageLazyLoading'
export { useGridVirtualization } from '../../hooks/performance/useGridVirtualization'
export { useLogStreamProcessor } from '../../hooks/performance/useLogStreamProcessor'
