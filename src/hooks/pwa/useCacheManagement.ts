
import { useCallback } from 'react'

export const useCacheManagement = () => {
  // Limpiar cache
  const clearCache = useCallback(async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
        console.log('✅ [PWA] Cache limpiado')
        return true
      } catch (error) {
        console.error('❌ [PWA] Error limpiando cache:', error)
        return false
      }
    }
    return false
  }, [])

  // Obtener estadísticas de cache
  const getCacheStats = useCallback(async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        const stats = await Promise.all(
          cacheNames.map(async (cacheName) => {
            const cache = await caches.open(cacheName)
            const keys = await cache.keys()
            return {
              name: cacheName,
              size: keys.length,
              sizeInBytes: 0
            }
          })
        )
        return stats
      } catch (error) {
        console.error('❌ [PWA] Error obteniendo estadísticas de cache:', error)
        return []
      }
    }
    return []
  }, [])

  return {
    clearCache,
    getCacheStats
  }
}
