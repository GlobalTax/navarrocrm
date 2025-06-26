
import { useState, useCallback, useRef, useEffect } from 'react'
import { ENV_CONFIG } from '@/config/environment'

interface CacheItem<T = any> {
  key: string
  value: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  size: number
  priority: 'low' | 'medium' | 'high'
}

interface HybridCacheOptions {
  maxMemorySize?: number // MB
  maxIndexedDBSize?: number // MB
  maxMemoryItems?: number
  memoryTTL?: number // milliseconds
  persistentTTL?: number // milliseconds
  strategy?: 'LRU' | 'LFU' | 'FIFO'
  enablePersistence?: boolean
}

interface CacheStats {
  memoryItems: number
  memorySize: number
  persistentItems: number
  persistentSize: number
  hitRate: number
  missRate: number
  promotions: number
  evictions: number
}

class HybridCacheEngine {
  private memoryCache = new Map<string, CacheItem>()
  private db: IDBDatabase | null = null
  private dbName = 'CRMHybridCache'
  private version = 2
  private storeName = 'cache'
  private stats: CacheStats = {
    memoryItems: 0,
    memorySize: 0,
    persistentItems: 0,
    persistentSize: 0,
    hitRate: 0,
    missRate: 0,
    promotions: 0,
    evictions: 0
  }
  private options: Required<HybridCacheOptions>
  private accessHistory = new Map<string, number>()

  constructor(options: HybridCacheOptions = {}) {
    this.options = {
      maxMemorySize: options.maxMemorySize || 50, // 50MB para memoria
      maxIndexedDBSize: options.maxIndexedDBSize || ENV_CONFIG.cache.maxSize,
      maxMemoryItems: options.maxMemoryItems || 500,
      memoryTTL: options.memoryTTL || 2 * 60 * 1000, // 2 minutos en memoria
      persistentTTL: options.persistentTTL || ENV_CONFIG.cache.ttl,
      strategy: options.strategy || ENV_CONFIG.cache.strategy,
      enablePersistence: options.enablePersistence !== false
    }

    if (ENV_CONFIG.development.debug) {
      console.log('💾 [HybridCache] Configuración inicializada:', this.options)
    }
  }

  async init(): Promise<void> {
    if (!this.options.enablePersistence) {
      if (ENV_CONFIG.development.enableLogs) {
        console.log('💾 [HybridCache] Modo solo memoria inicializado')
      }
      return
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        this.loadStats()
        this.startCleanupInterval()
        if (ENV_CONFIG.development.enableLogs) {
          console.log('💾 [HybridCache] IndexedDB inicializado correctamente')
        }
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('lastAccessed', 'lastAccessed', { unique: false })
          store.createIndex('accessCount', 'accessCount', { unique: false })
          store.createIndex('priority', 'priority', { unique: false })
        }
      }
    })
  }

  async set<T>(key: string, value: T, options?: { 
    ttl?: number, 
    priority?: 'low' | 'medium' | 'high',
    forceMemory?: boolean 
  }): Promise<void> {
    const { ttl, priority = 'medium', forceMemory = false } = options || {}
    
    const item: CacheItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || (forceMemory ? this.options.memoryTTL : this.options.persistentTTL),
      accessCount: 0,
      lastAccessed: Date.now(),
      size: this.calculateSize(value),
      priority
    }

    // Decidir dónde almacenar basado en prioridad y configuración
    const shouldStoreInMemory = forceMemory || 
                               priority === 'high' || 
                               this.shouldPromoteToMemory(key, item)

    if (shouldStoreInMemory) {
      await this.setInMemory(item)
    }

    // Siempre intentar guardar en IndexedDB si está habilitado (excepto si es temporal)
    if (this.options.enablePersistence && !forceMemory) {
      await this.setInIndexedDB(item)
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // Intentar primero en memoria (más rápido)
    const memoryItem = this.memoryCache.get(key)
    if (memoryItem && !this.isExpired(memoryItem)) {
      this.updateAccessStats(memoryItem)
      this.stats.hitRate++
      return memoryItem.value as T
    }

    // Si no está en memoria o expiró, buscar en IndexedDB
    if (this.options.enablePersistence && this.db) {
      const persistentItem = await this.getFromIndexedDB<T>(key)
      if (persistentItem && !this.isExpired(persistentItem)) {
        this.updateAccessStats(persistentItem)
        
        // Promover a memoria si es accedido frecuentemente
        if (this.shouldPromoteToMemory(key, persistentItem)) {
          await this.promoteToMemory(persistentItem)
          this.stats.promotions++
        }
        
        this.stats.hitRate++
        return persistentItem.value
      }
    }

    this.stats.missRate++
    return null
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key)
    this.accessHistory.delete(key)
    
    if (this.options.enablePersistence && this.db) {
      await this.deleteFromIndexedDB(key)
    }
  }

  async clear(): Promise<void> {
    this.memoryCache.clear()
    this.accessHistory.clear()
    
    if (this.options.enablePersistence && this.db) {
      await this.clearIndexedDB()
    }
    
    this.resetStats()
  }

  private async setInMemory<T>(item: CacheItem<T>): Promise<void> {
    // Verificar límites antes de insertar
    await this.enforceMemoryLimits(item.size)
    
    this.memoryCache.set(item.key, item)
    this.stats.memoryItems = this.memoryCache.size
    this.stats.memorySize += item.size
  }

  private async setInIndexedDB<T>(item: CacheItem<T>): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(item)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async getFromIndexedDB<T>(key: string): Promise<CacheItem<T> | null> {
    if (!this.db) return null

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onsuccess = () => {
        resolve(request.result || null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  private async deleteFromIndexedDB(key: string): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async clearIndexedDB(): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private shouldPromoteToMemory(key: string, item: CacheItem): boolean {
    const accessCount = this.accessHistory.get(key) || 0
    return item.priority === 'high' || accessCount > 3 || item.accessCount > 2
  }

  private async promoteToMemory(item: CacheItem): Promise<void> {
    const memoryItem = { ...item, lastAccessed: Date.now() }
    await this.setInMemory(memoryItem)
  }

  private async enforceMemoryLimits(newItemSize: number): Promise<void> {
    const maxSizeBytes = this.options.maxMemorySize * 1024 * 1024
    
    while (
      (this.stats.memorySize + newItemSize > maxSizeBytes) ||
      (this.memoryCache.size >= this.options.maxMemoryItems)
    ) {
      const victimKey = this.selectEvictionVictim()
      if (victimKey) {
        this.memoryCache.delete(victimKey)
        this.stats.evictions++
      } else {
        break
      }
    }
  }

  private selectEvictionVictim(): string | null {
    if (this.memoryCache.size === 0) return null

    const items = Array.from(this.memoryCache.entries())
    
    switch (this.options.strategy) {
      case 'LRU':
        return items.reduce((oldest, [key, item]) => 
          item.lastAccessed < oldest[1].lastAccessed ? [key, item] : oldest
        )[0]
      
      case 'LFU':
        return items.reduce((least, [key, item]) => 
          item.accessCount < least[1].accessCount ? [key, item] : least
        )[0]
      
      case 'FIFO':
        return items.reduce((oldest, [key, item]) => 
          item.timestamp < oldest[1].timestamp ? [key, item] : oldest
        )[0]
        
      default:
        return items[0][0]
    }
  }

  private updateAccessStats(item: CacheItem): void {
    item.accessCount++
    item.lastAccessed = Date.now()
    
    const currentCount = this.accessHistory.get(item.key) || 0
    this.accessHistory.set(item.key, currentCount + 1)
  }

  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl
  }

  private calculateSize(value: any): number {
    return new Blob([JSON.stringify(value)]).size
  }

  private async loadStats(): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction([this.storeName], 'readonly')
    const store = transaction.objectStore(this.storeName)
    const request = store.getAll()

    request.onsuccess = () => {
      const items = request.result as CacheItem[]
      this.stats.persistentItems = items.length
      this.stats.persistentSize = items.reduce((sum, item) => sum + item.size, 0)
    }
  }

  private startCleanupInterval(): void {
    // Limpieza más frecuente: cada 5 minutos
    setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  private async cleanup(): Promise<void> {
    const now = Date.now()
    
    // Limpiar memoria
    for (const [key, item] of this.memoryCache.entries()) {
      if (this.isExpired(item)) {
        this.memoryCache.delete(key)
      }
    }
    
    // Limpiar IndexedDB
    if (this.options.enablePersistence && this.db) {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        const items = request.result as CacheItem[]
        items.forEach(item => {
          if (this.isExpired(item)) {
            store.delete(item.key)
          }
        })
      }
    }
    
    // Limpiar historial de acceso antiguo
    for (const [key] of this.accessHistory.entries()) {
      if (!this.memoryCache.has(key)) {
        this.accessHistory.delete(key)
      }
    }
  }

  private resetStats(): void {
    this.stats = {
      memoryItems: 0,
      memorySize: 0,
      persistentItems: 0,
      persistentSize: 0,
      hitRate: 0,
      missRate: 0,
      promotions: 0,
      evictions: 0
    }
  }

  getStats(): CacheStats {
    const totalRequests = this.stats.hitRate + this.stats.missRate
    return {
      ...this.stats,
      memoryItems: this.memoryCache.size,
      memorySize: Array.from(this.memoryCache.values()).reduce((sum, item) => sum + item.size, 0),
      hitRate: totalRequests > 0 ? this.stats.hitRate / totalRequests : 0,
      missRate: totalRequests > 0 ? this.stats.missRate / totalRequests : 0
    }
  }
}

// Hook principal para el cache híbrido
export const useHybridCache = (options?: HybridCacheOptions) => {
  const [cache, setCache] = useState<HybridCacheEngine | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [stats, setStats] = useState<CacheStats | null>(null)
  const initializeRef = useRef(false)

  useEffect(() => {
    if (initializeRef.current) return
    
    const initCache = async () => {
      try {
        initializeRef.current = true
        const hybridCache = new HybridCacheEngine(options)
        await hybridCache.init()
        setCache(hybridCache)
        setIsReady(true)
        if (ENV_CONFIG.development.enableLogs) {
          console.log('💾 [HybridCache] Sistema de cache híbrido inicializado')
        }
      } catch (error) {
        console.error('❌ [HybridCache] Error inicializando cache:', error)
        setIsReady(false)
      }
    }

    initCache()
  }, [options])

  const cacheRef = useRef<HybridCacheEngine | null>(null)
  cacheRef.current = cache

  const set = useCallback(async <T>(
    key: string, 
    value: T, 
    options?: { ttl?: number, priority?: 'low' | 'medium' | 'high', forceMemory?: boolean }
  ) => {
    if (!cacheRef.current) throw new Error('Cache not ready')
    await cacheRef.current.set(key, value, options)
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

  return {
    isReady,
    set,
    get,
    remove,
    clear,
    stats
  }
}
