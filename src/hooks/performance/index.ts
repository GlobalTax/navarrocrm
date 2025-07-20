// Performance hooks exports
export { useTimeout } from './useTimeout'
export { useInterval } from './useInterval'
export { useAbortController } from './useAbortController'
export { useCleanupEffect } from './useCleanupEffect'
export { usePerformanceMonitor } from './usePerformanceMonitor'
export { useMemoryTracker } from './useMemoryTracker'

// Phase 4: Error boundaries and monitoring
export { useWebVitals } from './useWebVitals'
export { useErrorRecovery } from './useErrorRecovery'
export { useSmartErrorBoundary } from './useSmartErrorBoundary'

// Phase 5: Rendering optimization
export { useIntersectionObserver } from './useIntersectionObserver'
export { useLazyRender } from './useLazyRender'
export { useSmartMemo, useClearMemoCache } from './useSmartMemo'

// Phase 6: Cache and persistence
export { useOfflineStorage } from './useOfflineStorage'
export { useNetworkStatus } from './useNetworkStatus'
export { useIntelligentCache } from './useIntelligentCache'
export { useOfflineSync } from './useOfflineSync'

// Re-export utilities
export { 
  createDebounce, 
  createThrottle, 
  createAsyncHandler, 
  CleanupManager, 
  useCleanupManager, 
  detectMemoryLeaks 
} from '@/utils/performanceOptimizer'