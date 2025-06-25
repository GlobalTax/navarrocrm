
import { useCallback } from 'react'
import { useIntelligentCache } from './useIntelligentCache'

interface CacheConfig {
  defaultTTL?: number
  maxSize?: number
  enableLRU?: boolean
}

// Hook para cache de formularios con auto-save
export const useFormCache = <T = any>(formId: string, config?: CacheConfig) => {
  const cache = useIntelligentCache({
    maxAge: config?.defaultTTL || 30 * 60 * 1000, // 30 minutos para formularios
    maxSize: config?.maxSize || 50, // Menos entradas para formularios
  })

  const saveFormData = useCallback(async (data: T) => {
    if (!cache.isReady) {
      throw new Error('Cache not ready')
    }
    await cache.set(`form_${formId}`, data)
    console.log(`💾 Form data saved for: ${formId}`)
  }, [cache, formId])

  const loadFormData = useCallback(async (): Promise<T | null> => {
    if (!cache.isReady) {
      return null
    }
    const data = await cache.get<T>(`form_${formId}`)
    if (data) {
      console.log(`📂 Form data loaded for: ${formId}`)
    }
    return data
  }, [cache, formId])

  const clearFormData = useCallback(async () => {
    if (!cache.isReady) {
      return false
    }
    await cache.remove(`form_${formId}`)
    console.log(`🗑️ Form data cleared for: ${formId}`)
    return true
  }, [cache, formId])

  // Auto-save con debounce
  const autoSave = useCallback((data: T, debounceMs: number = 1000) => {
    // Implementar debounce básico
    const timeoutId = setTimeout(() => {
      saveFormData(data)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [saveFormData])

  // Verificar si hay datos guardados
  const hasSavedData = useCallback(async (): Promise<boolean> => {
    if (!cache.isReady) {
      return false
    }
    const data = await cache.get(`form_${formId}`)
    return data !== null
  }, [cache, formId])

  return {
    saveFormData,
    loadFormData,
    clearFormData,
    autoSave,
    hasSavedData,
    ...cache
  }
}
