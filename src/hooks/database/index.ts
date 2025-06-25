
// Database Optimization System Exports
export { useOptimizedQuery } from './useOptimizedQuery'
export { useOptimizedSearch } from './useOptimizedSearch'
export { useOptimizedQueryWithRelations } from './useOptimizedQueryWithRelations'
export { useDatabaseStats } from './useDatabaseStats'

// Service exports
export { DatabaseOptimizer } from '@/services/database/DatabaseOptimizer'
export type {
  QueryOptions,
  QueryResult,
  DatabaseStats
} from '@/services/database/DatabaseOptimizer'
