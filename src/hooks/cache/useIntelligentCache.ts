import { useState, useEffect, useCallback, useRef } from 'react'

interface CacheItem<T = any> {
  key: string
  value: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  size: number
}

interface CacheOptions {
  maxSize?: number // MB
  maxAge?: number // milliseconds
  maxItems?: number
  strategy?: 'LRU' | 'LFU' | 'FIFO'
}

interface CacheStats {
  totalItems: number
  totalSize: number
  hitRate: number
  missRate: number
  evictions: number
}

class IntelligentCacheEngine {
  private db: IDBDatabase | null = null
  private dbName = 'CRMIntelligentCache'
  private version = 1
  private storeName = 'cache'
  private stats: CacheStats = {
    totalItems: 0,
    totalSize: 0,
    hitRate: 0,
    missRate: 0,
    evictions: 0
  }
  private options: Required<CacheOptions>

  constructor(options: CacheOptions = {}) {
    this.options = {
      maxSize: options.maxSize || 100,
      maxAge: options.maxAge || 24 * 60 * 60 * 1000,
      maxItems: options.maxItems || 1000,
      strategy: options.strategy || 'LRU'
    }
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        this.loadStats()
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('lastAccessed', 'lastAccessed', { unique: false })
          store.createIndex('accessCount', 'accessCount', { unique: false })
        }
      }
    })
  }

  private async loadStats(): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction([this.storeName], 'readonly')
    const store = transaction.objectStore(this.storeName)
    const request = store.getAll()

    request.onsuccess = () => {
      const items = request.result as CacheItem[]
      this.stats.totalItems = items.length
      this.stats.totalSize = items.reduce((sum, item) => sum + item.size, 0)
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.db) throw new Error('Cache not initialized')

    const item: CacheItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || this.options.maxAge,
      accessCount: 0,
      lastAccessed: Date.now(),
      size: this.calculateSize(value)
    }

    // Verificar límites antes de insertar
    await this.enforceLimits(item.size)

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(item)

      request.onsuccess = () => {
        this.updateStats(item.size, 0)
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.db) throw new Error('Cache not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onsuccess = () => {
        const item = request.result as CacheItem<T> | undefined

        if (!item) {
          this.stats.missRate++
          resolve(null)
          return
        }

        // Verificar TTL
        if (Date.now() - item.timestamp > item.ttl) {
          this.delete(key)
          this.stats.missRate++
          resolve(null)
          return
        }

        // Actualizar estadísticas de acceso
        item.accessCount++
        item.lastAccessed = Date.now()
        store.put(item)

        this.stats.hitRate++
        resolve(item.value)
      }

      request.onerror = () => reject(request.error)
    })
  }

  async delete(key: string): Promise<void> {
    if (!this.db) throw new Error('Cache not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear(): Promise<void> {
    if (!this.db) throw new Error('Cache not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onsuccess = () => {
        this.stats = {
          totalItems: 0,
          totalSize: 0,
          hitRate: 0,
          missRate: 0,
          evictions: 0
        }
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }

  private async enforceLimits(newItemSize: number): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction([this.storeName], 'readonly')
    const store = transaction.objectStore(this.storeName)
    const request = store.getAll()

    request.onsuccess = () => {
      const items = request.result as CacheItem[]
      
      const sortedItems = this.sortByStrategy(items)
      
      let currentSize = items.reduce((sum, item) => sum + item.size, 0)
      let currentCount = items.length

      for (const item of sortedItems) {
        if (currentSize + newItemSize <= this.options.maxSize * 1024 * 1024 &&
            currentCount < this.options.maxItems) {
          break
        }

        this.delete(item.key)
        currentSize -= item.size
        currentCount--
        this.stats.evictions++
      }
    }
  }

  private sortByStrategy(items: CacheItem[]): CacheItem[] {
    switch (this.options.strategy) {
      case 'LRU':
        return items.sort((a, b) => a.lastAccessed - b.lastAccessed)
      case 'LFU':
        return items.sort((a, b) => a.accessCount - b.accessCount)
      case 'FIFO':
        return items.sort((a, b) => a.timestamp - b.timestamp)
      default:
        return items
    }
  }

  private calculateSize(value: any): number {
    return new Blob([JSON.stringify(value)]).size
  }

  private updateStats(size: number, accessCount: number): void {
    this.stats.totalSize += size
    this.stats.totalItems++
  }

  getStats(): CacheStats {
    const totalRequests = this.stats.hitRate + this.stats.missRate
    return {
      ...this.stats,
      hitRate: totalRequests > 0 ? this.stats.hitRate / totalRequests : 0,
      missRate: totalRequests > 0 ? this.stats.missRate / totalRequests : 0
    }
  }

  async cleanup(): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)
    const request = store.getAll()

    request.onsuccess = () => {
      const items = request.result as CacheItem[]
      const now = Date.now()

      items.forEach(item => {
        if (now - item.timestamp > item.ttl) {
          this.delete(item.key)
        }
      })
    }
  }
}

// Hook mejorado para usar el cache inteligente
export const useIntelligentCache = (options?: CacheOptions) => {
  const [cache, setCache] = useState<IntelligentCacheEngine | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [stats, setStats] = useState<CacheStats | null>(null)
  const initializeRef = useRef(false)

  useEffect(() => {
    if (initializeRef.current) return
    
    const initCache = async () => {
      try {
        initializeRef.current = true
        const intelligentCache = new IntelligentCacheEngine(options)
        await intelligentCache.init()
        setCache(intelligentCache)
        setIsReady(true)
        console.log('💾 [Cache] Sistema de cache inteligente inicializado')
      } catch (error) {
        console.error('❌ [Cache] Error inicializando cache:', error)
        setIsReady(false)
      }
    }

    initCache()
  }, [options])

  // Usar refs para callbacks estables
  const cacheRef = useRef<IntelligentCacheEngine | null>(null)
  cacheRef.current = cache

  const set = useCallback(async <T>(key: string, value: T, ttl?: number) => {
    if (!cacheRef.current) throw new Error('Cache not ready')
    await cacheRef.current.set(key, value, ttl)
    setStats(cacheRef.current.getStats())
  }, [])

  const get = useCallback(async <T>(key: string): Promise<T | null> => {
    if (!cacheRef.current) throw new Error('Cache not ready')
    const result = await cacheRef.current.get<T>(key)
    setStats(cacheRef.current.getStats())
    return result
  }, [])

  const remove = useCallback(async (key: string) => {
    if (!cacheRef.current) throw new Error('Cache not ready')
    await cacheRef.current.delete(key)
    setStats(cacheRef.current.getStats())
  }, [])

  const clear = useCallback(async () => {
    if (!cacheRef.current) throw new Error('Cache not ready')
    await cacheRef.current.clear()
    setStats(cacheRef.current.getStats())
  }, [])

  const cleanup = useCallback(async () => {
    if (!cacheRef.current) throw new Error('Cache not ready')
    await cacheRef.current.cleanup()
    setStats(cacheRef.current.getStats())
  }, [])

  // Limpieza automática cada hora
  useEffect(() => {
    if (!isReady || !cache) return

    const interval = setInterval(cleanup, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [isReady, cleanup, cache])

  return {
    isReady,
    set,
    get,
    remove,
    clear,
    cleanup,
    stats
  }
}
