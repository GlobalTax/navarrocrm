
import { useState, useCallback } from 'react'
import React from 'react'

export const useLazyComponent = <T extends any>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ComponentType
) => {
  const [Component, setComponent] = useState<React.ComponentType<T> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadComponent = useCallback(async () => {
    if (Component || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const module = await importFn()
      setComponent(() => module.default)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [Component, isLoading, importFn])

  return {
    Component: Component || fallback,
    isLoading,
    error,
    loadComponent
  }
}
