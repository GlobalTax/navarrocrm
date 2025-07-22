
import { useState, useCallback, useEffect, useRef } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface CacheOptions {
  maxSize?: number // MB
  ttl?: number // milliseconds
  compressionEnabled?: boolean
  persistToIndexedDB?: boolean
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  size: number
  accessCount: number
  lastAccessed: number
  compressed?: boolean
}

interface CacheStats {
  size: number
  entries: number
  hitRate: number
  missRate: number
  totalRequests: number
}

export const useDocumentCache = <T = any>(options: CacheOptions = {}) => {
  const {
    maxSize = 50, // 50MB por defecto
    ttl = 30 * 60 * 1000, // 30 minutos
    compressionEnabled = true,
    persistToIndexedDB = true
  } = options

  const logger = useLogger('DocumentCache')
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map())
  const stats = useRef({
    hits: 0,
    misses: 0,
    totalRequests: 0
  })

  // Comprimir datos usando algoritmo simple
  const compressData = useCallback((data: T): { compressed: string; size: number } => {
    try {
      const jsonString = JSON.stringify(data)
      
      if (!compressionEnabled || jsonString.length < 1000) {
        return { compressed: jsonString, size: new Blob([jsonString]).size }
      }

      // Compresión simple: reemplazar patrones repetitivos
      let compressed = jsonString
        .replace(/\s+/g, ' ') // Espacios múltiples
        .replace(/","/g, '","') // Optimizar comillas
        .replace(/":"/g, '":"') // Optimizar dos puntos

      // Detectar y comprimir patrones HTML comunes
      const patterns = [
        [/<p>/g, '<p>'],
        [/<\/p>/g, '</p>'],
        [/<br>/g, '<br>'],
        [/<br\/>/g, '<br/>'],
        [/class="/g, 'c="'],
        [/style="/g, 's="']
      ]

      patterns.forEach(([pattern, replacement]) => {
        compressed = compressed.replace(pattern, replacement as string)
      })

      const size = new Blob([compressed]).size
      
      logger.debug('📦 Datos comprimidos', {
        original: jsonString.length,
        compressed: compressed.length,
        ratio: ((1 - compressed.length / jsonString.length) * 100).toFixed(1) + '%'
      })

      return { compressed, size }
    } catch (error) {
      logger.warn('Error comprimiendo datos:', error)
      const jsonString = JSON.stringify(data)
      return { compressed: jsonString, size: new Blob([jsonString]).size }
    }
  }, [compressionEnabled, logger])

  // Descomprimir datos
  const decompressData = useCallback((compressed: string): T => {
    try {
      // En este ejemplo simple, solo parseamos JSON
      // En implementación real, usarías algoritmos como gzip o brotli
      return JSON.parse(compressed) as T
    } catch (error) {
      logger.error('Error descomprimiendo datos:', error)
      throw error
    }
  }, [logger])

  // Calcular tamaño total del cache
  const getCacheSize = useCallback((): number => {
    let totalSize = 0
    cache.current.forEach(entry => {
      totalSize += entry.size
    })
    return totalSize / (1024 * 1024) // MB
  }, [])

  // Limpiar entradas expiradas
  const cleanupExpired = useCallback(() => {
    const now = Date.now()
    let removed = 0

    cache.current.forEach((entry, key) => {
      if (now - entry.timestamp > ttl) {
        cache.current.delete(key)
        removed++
      }
    })

    if (removed > 0) {
      logger.info('🧹 Cache cleanup', { removedEntries: removed })
    }
  }, [ttl, logger])

  // Estrategia LRU para liberar espacio
  const evictLRU = useCallback(() => {
    if (cache.current.size === 0) return

    let oldestKey = ''
    let oldestTime = Date.now()

    // Encontrar la entrada menos accedida recientemente
    cache.current.forEach((entry, key) => {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    })

    if (oldestKey) {
      cache.current.delete(oldestKey)
      logger.info('🗑️ Entrada LRU eliminada', { key: oldestKey })
    }
  }, [logger])

  // Gestionar límites de tamaño
  const ensureSizeLimit = useCallback(async () => {
    while (getCacheSize() > maxSize && cache.current.size > 0) {
      evictLRU()
    }
  }, [getCacheSize, maxSize, evictLRU])

  // Guardar en IndexedDB
  const persistToStorage = useCallback(async (key: string, entry: CacheEntry<T>) => {
    if (!persistToIndexedDB) return

    try {
      const request = indexedDB.open('DocumentCache', 1)
      
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' })
        }
      }

      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['cache'], 'readwrite')
        const store = transaction.objectStore('cache')
        
        store.put({
          key,
          ...entry,
          data: JSON.stringify(entry.data)
        })
      }
    } catch (error) {
      logger.warn('Error persistiendo en IndexedDB:', error)
    }
  }, [persistToIndexedDB, logger])

  // Cargar desde IndexedDB
  const loadFromStorage = useCallback(async (key: string): Promise<T | null> => {
    if (!persistToIndexedDB) return null

    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('DocumentCache', 1)
        
        request.onsuccess = () => {
          const db = request.result
          const transaction = db.transaction(['cache'], 'readonly')
          const store = transaction.objectStore('cache')
          const getRequest = store.get(key)
          
          getRequest.onsuccess = () => {
            const result = getRequest.result
            if (result && Date.now() - result.timestamp < ttl) {
              resolve(JSON.parse(result.data))
            } else {
              resolve(null)
            }
          }
          
          getRequest.onerror = () => resolve(null)
        }
        
        request.onerror = () => resolve(null)
      } catch (error) {
        logger.warn('Error cargando desde IndexedDB:', error)
        resolve(null)
      }
    })
  }, [persistToIndexedDB, ttl, logger])

  // Obtener del cache
  const get = useCallback(async (key: string): Promise<T | null> => {
    stats.current.totalRequests++

    // Buscar en cache en memoria
    const entry = cache.current.get(key)
    if (entry && Date.now() - entry.timestamp < ttl) {
      entry.accessCount++
      entry.lastAccessed = Date.now()
      stats.current.hits++
      
      logger.debug('📋 Cache hit', { key, accessCount: entry.accessCount })
      return entry.compressed ? decompressData(entry.data as string) : entry.data
    }

    // Buscar en IndexedDB
    const persistedData = await loadFromStorage(key)
    if (persistedData) {
      await set(key, persistedData) // Recargar en memoria
      stats.current.hits++
      return persistedData
    }

    stats.current.misses++
    logger.debug('❌ Cache miss', { key })
    return null
  }, [ttl, decompressData, loadFromStorage, logger])

  // Guardar en cache
  const set = useCallback(async (key: string, data: T): Promise<void> => {
    try {
      cleanupExpired()
      
      const { compressed, size } = compressData(data)
      const now = Date.now()
      
      const entry: CacheEntry<T> = {
        data: compressionEnabled ? (compressed as T) : data,
        timestamp: now,
        size,
        accessCount: 1,
        lastAccessed: now,
        compressed: compressionEnabled
      }

      cache.current.set(key, entry)
      await ensureSizeLimit()
      await persistToStorage(key, entry)
      
      logger.debug('💾 Datos cacheados', { 
        key, 
        size: (size / 1024).toFixed(1) + 'KB',
        compressed: compressionEnabled 
      })
    } catch (error) {
      logger.error('Error guardando en cache:', error)
    }
  }, [cleanupExpired, compressData, compressionEnabled, ensureSizeLimit, persistToStorage, logger])

  // Eliminar del cache
  const remove = useCallback((key: string): boolean => {
    const deleted = cache.current.delete(key)
    
    // También eliminar de IndexedDB
    if (persistToIndexedDB) {
      try {
        const request = indexedDB.open('DocumentCache', 1)
        request.onsuccess = () => {
          const db = request.result
          const transaction = db.transaction(['cache'], 'readwrite')
          const store = transaction.objectStore('cache')
          store.delete(key)
        }
      } catch (error) {
        logger.warn('Error eliminando de IndexedDB:', error)
      }
    }
    
    if (deleted) {
      logger.debug('🗑️ Entrada eliminada', { key })
    }
    return deleted
  }, [persistToIndexedDB, logger])

  // Limpiar todo el cache
  const clear = useCallback(() => {
    const size = cache.current.size
    cache.current.clear()
    
    // Reset stats
    stats.current = { hits: 0, misses: 0, totalRequests: 0 }
    
    // Limpiar IndexedDB
    if (persistToIndexedDB) {
      try {
        const request = indexedDB.open('DocumentCache', 1)
        request.onsuccess = () => {
          const db = request.result
          const transaction = db.transaction(['cache'], 'readwrite')
          const store = transaction.objectStore('cache')
          store.clear()
        }
      } catch (error) {
        logger.warn('Error limpiando IndexedDB:', error)
      }
    }
    
    logger.info('🧹 Cache limpiado completamente', { clearedEntries: size })
  }, [persistToIndexedDB, logger])

  // Obtener estadísticas
  const getStats = useCallback((): CacheStats => {
    const currentStats = stats.current
    const hitRate = currentStats.totalRequests > 0 
      ? (currentStats.hits / currentStats.totalRequests) * 100 
      : 0
    
    return {
      size: getCacheSize(),
      entries: cache.current.size,
      hitRate: Number(hitRate.toFixed(2)),
      missRate: Number((100 - hitRate).toFixed(2)),
      totalRequests: currentStats.totalRequests
    }
  }, [getCacheSize])

  // Cleanup automático
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupExpired()
    }, 5 * 60 * 1000) // Cada 5 minutos

    return () => clearInterval(interval)
  }, [cleanupExpired])

  return {
    get,
    set,
    remove,
    clear,
    getStats,
    has: (key: string) => cache.current.has(key),
    size: () => cache.current.size,
    keys: () => Array.from(cache.current.keys())
  }
}
