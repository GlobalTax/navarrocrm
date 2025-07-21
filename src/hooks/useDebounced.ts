
import { useState, useEffect, useRef } from 'react'
import { createLogger } from '@/utils/logger'
import { createError, handleError } from '@/utils/errorHandler'

/**
 * Hook que debouncea un valor, retrasando su actualización hasta que haya pasado
 * un tiempo específico sin cambios. Útil para optimizar búsquedas y validaciones.
 * 
 * @template T - Tipo del valor a debouncer
 * @param value - El valor a debouncer
 * @param delay - Tiempo en milisegundos a esperar antes de actualizar (mínimo 0, máximo 10000)
 * @returns El valor debounceado
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearchTerm = useDebounced(searchTerm, 300)
 * 
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     performSearch(debouncedSearchTerm)
 *   }
 * }, [debouncedSearchTerm])
 * ```
 * 
 * @throws {Error} Si delay no es un número válido o está fuera del rango permitido
 */
export function useDebounced<T>(value: T, delay: number): T {
  const logger = createLogger('useDebounced')
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Validación de parámetros
  useEffect(() => {
    try {
      // Validar delay
      if (typeof delay !== 'number' || isNaN(delay)) {
        throw createError('Invalid delay parameter', {
          severity: 'medium',
          userMessage: 'El delay debe ser un número válido',
          technicalMessage: `Expected number, received ${typeof delay}: ${delay}`
        })
      }

      if (delay < 0) {
        throw createError('Negative delay not allowed', {
          severity: 'medium',
          userMessage: 'El delay no puede ser negativo',
          technicalMessage: `Delay cannot be negative: ${delay}`
        })
      }

      if (delay > 10000) {
        logger.warn('Large delay detected', { 
          metadata: { delay, recommended: 'Use delays under 5000ms for better UX' }
        })
      }

      logger.debug('useDebounced initialized', { 
        metadata: { 
          valueType: typeof value, 
          delay,
          hasValue: value !== undefined && value !== null
        }
      })

    } catch (error) {
      handleError(error, 'useDebounced-validation')
      // Fallback a delay seguro
      delay = Math.max(0, Math.min(delay || 300, 10000))
    }
  }, [delay, logger])

  useEffect(() => {
    try {
      // Limpiar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Configurar nuevo timeout
      timeoutRef.current = setTimeout(() => {
        logger.debug('Debounced value updated', { 
          metadata: { 
            oldValue: debouncedValue,
            newValue: value,
            delay
          }
        })
        setDebouncedValue(value)
      }, delay)

      // Cleanup
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    } catch (error) {
      logger.error('Error in debounce effect', { error })
      // Fallback: actualizar inmediatamente en caso de error
      setDebouncedValue(value)
    }
  }, [value, delay, logger, debouncedValue])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedValue
}

/**
 * Hook especializado para debouncer términos de búsqueda con validación adicional
 * 
 * @param searchTerm - Término de búsqueda a debouncer
 * @param delay - Tiempo de delay (por defecto 300ms)
 * @returns Término de búsqueda debounceado y validado
 */
export function useDebouncedSearch(searchTerm: string, delay: number = 300): string {
  const logger = createLogger('useDebouncedSearch')
  
  // Validar y limpiar el término de búsqueda
  const sanitizedTerm = typeof searchTerm === 'string' 
    ? searchTerm.trim().substring(0, 100) // Límite de 100 caracteres
    : ''

  const debouncedTerm = useDebounced(sanitizedTerm, delay)

  useEffect(() => {
    if (sanitizedTerm !== searchTerm && searchTerm) {
      logger.warn('Search term was sanitized', {
        metadata: {
          original: searchTerm,
          sanitized: sanitizedTerm,
          reason: 'Invalid type or length exceeded'
        }
      })
    }
  }, [searchTerm, sanitizedTerm, logger])

  return debouncedTerm
}
