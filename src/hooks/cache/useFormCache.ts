
import { useCallback } from 'react'
import { useIntelligentCache } from './useIntelligentCache'

interface CacheConfig {
  defaultTTL?: number
  maxSize?: number
  enableLRU?: boolean
}

// Hook para cache de formularios con auto-save
export const useFormCache = <T>(formId: string, config?: CacheConfig) => {
  const cache = useIntelligentCache<T>({
    defaultTTL: 30 * 60 * 1000, // 30 minutos para formularios
    maxSize: 50, // Menos entradas para formularios
    ...config
  })

  const saveFormData = useCallback((data: T) => {
    cache.set(`form_${formId}`, data)
    console.log(`💾 Form data saved for: ${formId}`)
  }, [cache, formId])

  const loadFormData = useCallback((): T | null => {
    const data = cache.get(`form_${formId}`)
    if (data) {
      console.log(`📂 Form data loaded for: ${formId}`)
    }
    return data
  }, [cache, formId])

  const clearFormData = useCallback(() => {
    const removed = cache.remove(`form_${formId}`)
    if (removed) {
      console.log(`🗑️ Form data cleared for: ${formId}`)
    }
    return removed
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
  const hasSavedData = useCallback((): boolean => {
    return cache.get(`form_${formId}`) !== null
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
