
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class AnalyticsCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutos

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    
    if (isExpired) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'))
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  // Generar clave de caché basada en parámetros
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|')
    
    return `${prefix}:${sortedParams}`
  }

  // Wrapper para funciones con caché automático
  async withCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    // Intentar obtener de caché
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Si no está en caché, ejecutar función y guardar resultado
    try {
      const result = await fetchFn()
      this.set(key, result, ttl)
      return result
    } catch (error) {
      console.error(`Error fetching data for cache key ${key}:`, error)
      throw error
    }
  }

  // Estadísticas del caché
  getStats() {
    let totalSize = 0
    let expiredCount = 0
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      totalSize += JSON.stringify(entry.data).length
      
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++
      }
    }

    return {
      totalEntries: this.cache.size,
      totalSize,
      expiredCount,
      hitRate: this.calculateHitRate()
    }
  }

  private hitCount = 0
  private missCount = 0

  private calculateHitRate(): number {
    const total = this.hitCount + this.missCount
    return total > 0 ? (this.hitCount / total) * 100 : 0
  }

  // Limpiar entradas expiradas
  cleanup(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Iniciar limpieza automática
  startAutoCleanup(intervalMs: number = 60000): () => void {
    const interval = setInterval(() => {
      this.cleanup()
    }, intervalMs)

    return () => clearInterval(interval)
  }
}

export const analyticsCache = new AnalyticsCache()

// Iniciar limpieza automática cada minuto
analyticsCache.startAutoCleanup()
