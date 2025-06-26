
import { useCallback, useRef, useEffect } from 'react'
import { useHybridCache } from './useHybridCache'

interface FormCacheOptions {
  autoSave?: boolean
  saveInterval?: number
  maxVersions?: number
}

interface FormVersion {
  data: any
  timestamp: number
  version: number
}

export const useOptimizedFormCache = (
  formId: string,
  options: FormCacheOptions = {}
) => {
  const {
    autoSave = true,
    saveInterval = 30000, // 30 segundos
    maxVersions = 5
  } = options

  const cache = useHybridCache({
    maxMemorySize: 50, // 50MB para formularios
    maxMemoryItems: 100,
    memoryTTL: 30 * 60 * 1000, // 30 minutos en memoria
    persistentTTL: 24 * 60 * 60 * 1000, // 24 horas en IndexedDB
    enablePersistence: true
  })

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const versionCounterRef = useRef(0)

  // Generar clave de cache para el formulario
  const getFormKey = useCallback((suffix = '') => {
    return `form-${formId}${suffix ? `-${suffix}` : ''}`
  }, [formId])

  // Guardar datos del formulario
  const saveFormData = useCallback(async (data: any, isAutoSave = false) => {
    if (!cache.isReady) return

    const version = ++versionCounterRef.current
    const formVersion: FormVersion = {
      data,
      timestamp: Date.now(),
      version
    }

    // Guardar versión actual
    await cache.set(getFormKey(), formVersion, {
      ttl: 24 * 60 * 60 * 1000, // 24 horas
      priority: 'high',
      forceMemory: true
    })

    // Guardar en historial de versiones
    if (!isAutoSave) {
      const historyKey = getFormKey('history')
      const history = await cache.get<FormVersion[]>(historyKey) || []
      
      history.unshift(formVersion)
      
      // Mantener solo las últimas versiones
      if (history.length > maxVersions) {
        history.splice(maxVersions)
      }
      
      await cache.set(historyKey, history, {
        ttl: 7 * 24 * 60 * 60 * 1000, // 7 días
        priority: 'medium'
      })
    }

    console.log(`💾 [Form Cache] Saved ${formId} (v${version})${isAutoSave ? ' [AUTO]' : ''}`)
  }, [cache, getFormKey, formId, maxVersions])

  // Cargar datos del formulario
  const loadFormData = useCallback(async (): Promise<any | null> => {
    if (!cache.isReady) return null

    const formVersion = await cache.get<FormVersion>(getFormKey())
    return formVersion?.data || null
  }, [cache, getFormKey])

  // Obtener historial de versiones
  const getFormHistory = useCallback(async (): Promise<FormVersion[]> => {
    if (!cache.isReady) return []

    const history = await cache.get<FormVersion[]>(getFormKey('history'))
    return history || []
  }, [cache, getFormKey])

  // Restaurar versión específica
  const restoreVersion = useCallback(async (version: number) => {
    const history = await getFormHistory()
    const targetVersion = history.find(v => v.version === version)
    
    if (targetVersion) {
      await saveFormData(targetVersion.data)
      return targetVersion.data
    }
    
    return null
  }, [getFormHistory, saveFormData])

  // Limpiar datos del formulario
  const clearFormData = useCallback(async () => {
    if (!cache.isReady) return

    await cache.remove(getFormKey())
    await cache.remove(getFormKey('history'))
    
    console.log(`🗑️ [Form Cache] Cleared ${formId}`)
  }, [cache, getFormKey, formId])

  // Auto-save con debounce
  const scheduleAutoSave = useCallback((data: any) => {
    if (!autoSave) return

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      saveFormData(data, true)
    }, saveInterval)
  }, [autoSave, saveFormData, saveInterval])

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  return {
    // Funciones principales
    saveFormData,
    loadFormData,
    clearFormData,
    
    // Historial de versiones
    getFormHistory,
    restoreVersion,
    
    // Auto-save
    scheduleAutoSave,
    
    // Estado
    isReady: cache.isReady
  }
}
