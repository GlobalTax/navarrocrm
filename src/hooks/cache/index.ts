
// Cache System Exports - Hybrid Cache System
export { useHybridCache } from './useHybridCache'
export { useOptimizedAPICache } from './useOptimizedAPICache' 
export { useOptimizedFormCache } from './useOptimizedFormCache'

// Legacy Cache System (mantener compatibilidad)
export { useIntelligentCache } from './useIntelligentCache'
export { useAPICache } from './useAPICache'
export { useFormCache } from './useFormCache'
export { useCachedQuery } from './useCachedQuery'
export { useQueryCache } from './useQueryCache'

// Database Optimization System
export { useOptimizedQuery } from '../database/useOptimizedQuery'
export { useOptimizedSearch } from '../database/useOptimizedSearch'
export { useOptimizedQueryWithRelations } from '../database/useOptimizedQueryWithRelations'
export { useDatabaseStats } from '../database/useDatabaseStats'
export { useOptimizedContacts } from '../database/useOptimizedContacts'

// Cache Configuration Types
export type {
  CacheEntry,
  CacheConfig,
  CacheStats
} from './types'
