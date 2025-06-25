
export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

export interface CacheConfig {
  defaultTTL?: number
  maxSize?: number
  enableLRU?: boolean
}

export interface CacheStats {
  size: number
  expiredCount: number
  totalAccessCount: number
  mostAccessedKey: string
  maxAccessCount: number
  hitRate: number
}
