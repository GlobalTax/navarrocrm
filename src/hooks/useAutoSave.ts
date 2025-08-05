import { useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'

interface AutoSaveOptions {
  data: any
  onSave: (data: any) => Promise<boolean>
  delay?: number
  enableToasts?: boolean
  onSaveSuccess?: () => void
  onSaveError?: (error: any) => void
}

export function useAutoSave({
  data,
  onSave,
  delay = 30000, // 30 segundos por defecto
  enableToasts = true,
  onSaveSuccess,
  onSaveError
}: AutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedDataRef = useRef<string>('')
  const isSavingRef = useRef(false)

  const scheduleAutoSave = useCallback(() => {
    // Cancelar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Programar nuevo autosave
    timeoutRef.current = setTimeout(async () => {
      const currentDataString = JSON.stringify(data)
      
      // Solo guardar si los datos han cambiado y no se está guardando ya
      if (currentDataString !== lastSavedDataRef.current && !isSavingRef.current) {
        isSavingRef.current = true
        
        try {
          const success = await onSave(data)
          if (success) {
            lastSavedDataRef.current = currentDataString
            if (enableToasts) {
              toast.success('Datos guardados automáticamente', {
                duration: 2000
              })
            }
            onSaveSuccess?.()
          }
        } catch (error) {
          if (enableToasts) {
            toast.error('Error al guardar automáticamente')
          }
          onSaveError?.(error)
        } finally {
          isSavingRef.current = false
        }
      }
    }, delay)
  }, [data, onSave, delay, enableToasts, onSaveSuccess, onSaveError])

  // Efecto para programar autosave cuando cambian los datos
  useEffect(() => {
    scheduleAutoSave()
    
    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [scheduleAutoSave])

  // Función para forzar guardado inmediato
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    if (!isSavingRef.current) {
      isSavingRef.current = true
      try {
        const success = await onSave(data)
        if (success) {
          lastSavedDataRef.current = JSON.stringify(data)
          if (enableToasts) {
            toast.success('Datos guardados')
          }
          onSaveSuccess?.()
        }
        return success
      } catch (error) {
        if (enableToasts) {
          toast.error('Error al guardar')
        }
        onSaveError?.(error)
        return false
      } finally {
        isSavingRef.current = false
      }
    }
    return false
  }, [data, onSave, enableToasts, onSaveSuccess, onSaveError])

  return {
    saveNow,
    isSaving: isSavingRef.current
  }
}