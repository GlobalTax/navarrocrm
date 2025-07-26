import { useState, useEffect } from 'react'

/**
 * Hook para debouncing de valores
 * Evita múltiples disparos seguidos de búsquedas/filtros
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para debouncing de callbacks
 * Útil para optimizar funciones de búsqueda
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [debouncedCallback] = useState(() => {
    let timeoutId: NodeJS.Timeout

    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => callback(...args), delay)
    }) as T
  })

  return debouncedCallback
}