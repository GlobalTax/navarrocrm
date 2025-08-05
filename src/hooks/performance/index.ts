// Performance hooks exports
export { useTimeout } from './useTimeout'
export { useInterval } from './useInterval'
export { useAbortController } from './useAbortController'
export { useCleanupEffect } from './useCleanupEffect'
export { usePerformanceMonitor } from './usePerformanceMonitor'
export { useMemoryTracker } from './useMemoryTracker'

// Optimization hooks
export { useOptimizedMemo, getMemoStats, clearMemoStats } from '../useOptimizedMemo'
export { useRenderOptimization, useOptimizedCallback, useSmartMemo, getRenderStats, clearRenderStats } from '../useRenderOptimization'
export { useLoadingOptimization } from '../useLoadingOptimization'
export { useOptimizedEffect, useOnceEffect, useDebouncedEffect } from '../useOptimizedEffect'
export { useLogger, getStoredLogs, clearStoredLogs } from '../useLogger'
export { useLazyComponent } from '../useLazyComponent'

// Re-export utilities
export { 
  createDebounce, 
  createThrottle, 
  createAsyncHandler, 
  CleanupManager, 
  useCleanupManager, 
  detectMemoryLeaks 
} from '@/utils/performanceOptimizer'