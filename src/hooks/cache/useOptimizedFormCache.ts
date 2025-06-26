
import { useCallback, useEffect } from 'react'
import { useHybridCache } from './useHybridCache'

interface FormCacheOptions {
  autoSaveInterval?: number // milliseconds
  retentionTime?: number // milliseconds
  enableAutoSave?: boolean
}

// Hook especializado para cache de formularios con auto-guardado
export const useOptimizedFormCache = <T = any>(
  formId: string, 
  options: FormCacheOptions = {}
) => {
  const {
    autoSaveInterval = 3000, // 3 segundos
    retentionTime = 24 * 60 * 60 * 1000, // 24 horas
    enableAutoSave = true
  } = options

  const cache = useHybridCache({
    maxMemorySize: 10, // 10MB para formularios
    maxMemoryItems: 100,
    memoryTTL: retentionTime,
    persistentTTL: retentionTime,
    strategy: 'FIFO', // FIFO es mejor para formularios temporales
    enablePersistence: true
  })

  const formKey = `form_${formId}`

  const saveFormData = useCallback(async (data: T, options?: { immediate?: boolean }) => {
    if (!cache.isReady) {
      console.warn('❌ [FormCache] Cache no está listo')
      return false
    }

    try {
      await cache.set(formKey, data, {
        priority: 'medium',
        ttl: retentionTime,
        forceMemory: options?.immediate || false
      })
      
      if (ENV_CONFIG.development.enableLogs) {
        console.log(`💾 [FormCache] Datos guardados para: ${formId}`)
      }
      return true
    } catch (error) {
      console.error(`❌ [FormCache] Error guardando formulario ${formId}:`, error)
      return false
    }
  }, [cache, formKey, formId, retentionTime])

  const loadFormData = useCallback(async (): Promise<T | null> => {
    if (!cache.isReady) {
      return null
    }

    try {
      const data = await cache.get<T>(formKey)
      if (data && ENV_CONFIG.development.enableLogs) {
        console.log(`📂 [FormCache] Datos cargados para: ${formId}`)
      }
      return data
    } catch (error) {
      console.error(`❌ [FormCache] Error cargando formulario ${formId}:`, error)
      return null
    }
  }, [cache, formKey, formId])

  const clearFormData = useCallback(async (): Promise<boolean> => {
    if (!cache.isReady) {
      return false
    }

    try {
      await cache.remove(formKey)
      if (ENV_CONFIG.development.enableLogs) {
        console.log(`🗑️ [FormCache] Datos eliminados para: ${formId}`)
      }
      return true
    } catch (error) {
      console.error(`❌ [FormCache] Error eliminando formulario ${formId}:`, error)
      return false
    }
  }, [cache, formKey, formId])

  const hasSavedData = useCallback(async (): Promise<boolean> => {
    if (!cache.isReady) {
      return false
    }

    try {
      const data = await cache.get(formKey)
      return data !== null
    } catch (error) {
      console.error(`❌ [FormCache] Error verificando formulario ${formId}:`, error)
      return false
    }
  }, [cache, formKey, formId])

  // Auto-save con debounce mejorado
  const autoSave = useCallback((data: T): (() => void) => {
    if (!enableAutoSave || !cache.isReady) {
      return () => {}
    }

    const timeoutId = setTimeout(() => {
      saveFormData(data)
    }, autoSaveInterval)

    return () => clearTimeout(timeoutId)
  }, [saveFormData, autoSaveInterval, enableAutoSave, cache.isReady])

  // Crear snapshot del formulario para recuperación
  const createSnapshot = useCallback(async (data: T, label?: string): Promise<string> => {
    if (!cache.isReady) {
      throw new Error('Cache not ready')
    }

    const snapshotKey = `${formKey}_snapshot_${Date.now()}`
    const snapshotData = {
      data,
      label: label || 'Auto-snapshot',
      timestamp: Date.now(),
      formId
    }

    await cache.set(snapshotKey, snapshotData, {
      priority: 'low',
      ttl: 7 * 24 * 60 * 60 * 1000 // 7 días para snapshots
    })

    console.log(`📸 [FormCache] Snapshot creado: ${snapshotKey}`)
    return snapshotKey
  }, [cache, formKey, formId])

  // Validar integridad de datos guardados
  const validateSavedData = useCallback(async (validator: (data: T) => boolean): Promise<boolean> => {
    const data = await loadFormData()
    if (!data) return false
    
    try {
      return validator(data)
    } catch (error) {
      console.error(`❌ [FormCache] Error validando datos de ${formId}:`, error)
      return false
    }
  }, [loadFormData, formId])

  return {
    isReady: cache.isReady,
    saveFormData,
    loadFormData,
    clearFormData,
    hasSavedData,
    autoSave,
    createSnapshot,
    validateSavedData,
    stats: cache.stats
  }
}
