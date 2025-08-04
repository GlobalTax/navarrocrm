// Performance hooks exports
export { useTimeout } from './useTimeout'
export { useInterval } from './useInterval'
export { useAbortController } from './useAbortController'
export { useCleanupEffect } from './useCleanupEffect'
export { usePerformanceMonitor } from './usePerformanceMonitor'
export { useMemoryTracker } from './useMemoryTracker'
export { useAdvancedPerformanceMonitor } from './useAdvancedPerformanceMonitor'

// Export route preloader hooks (disabled to fix React context issues)
export { 
  useRoutePreloader, 
  useCriticalRoutePreloader, 
  useContextualPreloader 
} from './useRoutePreloader'

// Re-export utilities
export { 
  createDebounce, 
  createThrottle, 
  createAsyncHandler, 
  CleanupManager, 
  useCleanupManager, 
  detectMemoryLeaks 
} from '@/utils/performanceOptimizer'