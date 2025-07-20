import { useState, useEffect, useCallback } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface StorageOptions {
  key: string
  defaultValue?: any
  ttl?: number // time to live in ms
  compress?: boolean
  sync?: boolean // sync to server when online
}

interface StorageEntry<T> {
  data: T
  timestamp: number
  ttl?: number
  version: string
  compressed?: boolean
}

const STORAGE_VERSION = '1.0.0'
const COMPRESSION_THRESHOLD = 1024 // bytes

// Simple compression using JSON + base64
function compress(data: any): string {
  const json = JSON.stringify(data)
  if (json.length < COMPRESSION_THRESHOLD) return json
  
  try {
    return btoa(unescape(encodeURIComponent(json)))
  } catch {
    return json
  }
}

function decompress(data: string, isCompressed?: boolean): any {
  if (!isCompressed) return JSON.parse(data)
  
  try {
    return JSON.parse(decodeURIComponent(escape(atob(data))))
  } catch {
    return JSON.parse(data)
  }
}

export function useOfflineStorage<T>(options: StorageOptions) {
  const logger = useLogger('OfflineStorage')
  const { key, defaultValue, ttl, compress: enableCompress = false, sync = false } = options
  
  const [data, setData] = useState<T>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data from storage
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Try IndexedDB first, fallback to localStorage
      let stored: string | null = null
      
      try {
        const request = indexedDB.open('OfflineStorage', 1)
        
        request.onupgradeneeded = () => {
          const db = request.result
          if (!db.objectStoreNames.contains('cache')) {
            db.createObjectStore('cache', { keyPath: 'key' })
          }
        }

        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
        })

        const transaction = db.transaction(['cache'], 'readonly')
        const store = transaction.objectStore('cache')
        const getRequest = store.get(key)

        stored = await new Promise<string | null>((resolve) => {
          getRequest.onsuccess = () => {
            const result = getRequest.result
            resolve(result ? result.value : null)
          }
          getRequest.onerror = () => resolve(null)
        })

        db.close()
      } catch {
        // Fallback to localStorage
        stored = localStorage.getItem(key)
      }

      if (!stored) {
        setData(defaultValue)
        logger.info('📱 No hay datos almacenados', { key })
        return
      }

      const entry: StorageEntry<T> = JSON.parse(stored)
      
      // Check version compatibility
      if (entry.version !== STORAGE_VERSION) {
        logger.warn('📱 Versión incompatible, limpiando cache', { 
          stored: entry.version, 
          current: STORAGE_VERSION 
        })
        await removeData()
        setData(defaultValue)
        return
      }

      // Check TTL
      if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
        logger.info('📱 Datos expirados, limpiando', { 
          key, 
          age: Date.now() - entry.timestamp 
        })
        await removeData()
        setData(defaultValue)
        return
      }

      // Decompress and set data
      const decompressedData = decompress(entry.data as string, entry.compressed)
      setData(decompressedData)
      
      logger.info('📱 Datos cargados desde storage', { 
        key, 
        size: stored.length,
        compressed: entry.compressed 
      })

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      logger.error('📱 Error cargando datos', { key, error: errorMsg })
      setData(defaultValue)
    } finally {
      setIsLoading(false)
    }
  }, [key, defaultValue, ttl, logger])

  // Save data to storage
  const saveData = useCallback(async (newData: T) => {
    try {
      const shouldCompress = enableCompress
      const processedData = shouldCompress ? compress(newData) : newData

      const entry: StorageEntry<T> = {
        data: processedData as T,
        timestamp: Date.now(),
        ttl,
        version: STORAGE_VERSION,
        compressed: shouldCompress
      }

      const serialized = JSON.stringify(entry)

      // Try IndexedDB first, fallback to localStorage
      try {
        const request = indexedDB.open('OfflineStorage', 1)
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
        })

        const transaction = db.transaction(['cache'], 'readwrite')
        const store = transaction.objectStore('cache')
        await new Promise<void>((resolve, reject) => {
          const putRequest = store.put({ key, value: serialized })
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        })

        db.close()
      } catch {
        // Fallback to localStorage
        localStorage.setItem(key, serialized)
      }

      setData(newData)
      logger.info('📱 Datos guardados', { 
        key, 
        size: serialized.length,
        compressed: shouldCompress 
      })

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error guardando'
      setError(errorMsg)
      logger.error('📱 Error guardando datos', { key, error: errorMsg })
    }
  }, [key, ttl, enableCompress, logger])

  // Remove data from storage
  const removeData = useCallback(async () => {
    try {
      // Try IndexedDB first
      try {
        const request = indexedDB.open('OfflineStorage', 1)
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
        })

        const transaction = db.transaction(['cache'], 'readwrite')
        const store = transaction.objectStore('cache')
        await new Promise<void>((resolve, reject) => {
          const deleteRequest = store.delete(key)
          deleteRequest.onsuccess = () => resolve()
          deleteRequest.onerror = () => reject(deleteRequest.error)
        })

        db.close()
      } catch {
        // Fallback to localStorage
        localStorage.removeItem(key)
      }

      setData(defaultValue)
      logger.info('📱 Datos eliminados', { key })

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error eliminando'
      setError(errorMsg)
      logger.error('📱 Error eliminando datos', { key, error: errorMsg })
    }
  }, [key, defaultValue, logger])

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data,
    setData: saveData,
    removeData,
    reload: loadData,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}