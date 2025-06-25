
import { useState, useRef, useCallback, useEffect } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live en milisegundos
  accessCount: number
  lastAccessed: number
}

interface CacheConfig {
  defaultTTL?: number // Tiempo de vida por defecto en milisegundos
  maxSize?: number // Tamaño máximo del cache
  enableLRU?: boolean // Habilitar Least Recently Used eviction
}

export const useIntelligentCache = <T>(config: CacheConfig = {}) => {
  const {
    defaultTTL = 5 * 60 * 1000, // 5 minutos por defecto
    maxSize = 100,
    enableLRU = true
  } = config

  const cache = useRef<Map<string, CacheEntry<T>>>(new Map())
  const [, forceUpdate] = useState({})

  // Limpiar entradas expiradas
  const cleanupExpired = useCallback(() => {
    const now = Date.now()
    let hasChanges = false

    for (const [key, entry] of cache.current.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        cache.current.delete(key)
        hasChanges = true
      }
    }

    if (hasChanges) {
      forceUpdate({})
    }
  }, [])

  // Implementar LRU eviction si está habilitado
  const evictLRU = useCallback(() => {
    if (!enableLRU || cache.current.size <= maxSize) return

    let oldestKey = ''
    let oldestTime = Infinity

    for (const [key, entry] of cache.current.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      cache.current.delete(oldestKey)
      forceUpdate({})
    }
  }, [enableLRU, maxSize])

  // Obtener datos del cache
  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key)
    
    if (!entry) return null

    const now = Date.now()
    
    // Verificar si ha expirado
    if (now - entry.timestamp > entry.ttl) {
      cache.current.delete(key)
      return null
    }

    // Actualizar estadísticas de acceso
    entry.accessCount++
    entry.lastAccessed = now
    
    return entry.data
  }, [])

  // Guardar datos en el cache
  const set = useCallback((key: string, data: T, ttl?: number): void => {
    const now = Date.now()
    const entryTTL = ttl || defaultTTL

    // Evict LRU si es necesario antes de agregar
    evictLRU()

    cache.current.set(key, {
      data,
      timestamp: now,
      ttl: entryTTL,
      accessCount: 1,
      lastAccessed: now
    })

    forceUpdate({})
  }, [defaultTTL, evictLRU])

  // Eliminar entrada específica
  const remove = useCallback((key: string): boolean => {
    const deleted = cache.current.delete(key)
    if (deleted) {
      forceUpdate({})
    }
    return deleted
  }, [])

  // Limpiar todo el cache
  const clear = useCallback(() => {
    cache.current.clear()
    forceUpdate({})
  }, [])

  // Obtener estadísticas del cache
  const getStats = useCallback(() => {
    const now = Date.now()
    let totalSize = 0
    let expiredCount = 0
    let totalAccessCount = 0
    let mostAccessedKey = ''
    let maxAccessCount = 0

    for (const [key, entry] of cache.current.entries()) {
      totalSize++
      totalAccessCount += entry.accessCount

      if (now - entry.timestamp > entry.ttl) {
        expiredCount++
      }

      if (entry.accessCount > maxAccessCount) {
        maxAccessCount = entry.accessCount
        mostAccessedKey = key
      }
    }

    return {
      size: totalSize,
      expiredCount,
      totalAccessCount,
      mostAccessedKey,
      maxAccessCount,
      hitRate: totalAccessCount > 0 ? (totalAccessCount - expiredCount) / totalAccessCount : 0
    }
  }, [])

  // Función helper para obtener o calcular datos
  const getOrSet = useCallback(async (
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    // Intentar obtener del cache primero
    const cached = get(key)
    if (cached !== null) {
      return cached
    }

    // Si no está en cache, obtener y guardar
    try {
      const data = await fetcher()
      set(key, data, ttl)
      return data
    } catch (error) {
      console.error('Error fetching data for cache:', error)
      throw error
    }
  }, [get, set])

  // Limpiar entradas expiradas periódicamente
  useEffect(() => {
    const interval = setInterval(cleanupExpired, 60000) // Cada minuto
    return () => clearInterval(interval)
  }, [cleanupExpired])

  return {
    get,
    set,
    remove,
    clear,
    getStats,
    getOrSet,
    size: cache.current.size
  }
}
