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
