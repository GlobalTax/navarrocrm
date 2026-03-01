import { useCallback, useMemo, useRef, useState } from 'react'
import { useLogger } from './useLogger'

interface RenderStats {
  renders: number
  lastRender: number
  averageRenderTime: number
}

const renderStatsMap = new Map<string, RenderStats>()

export function useRenderOptimization(componentName?: string) {
  const logger = useLogger('RenderOptimization')
  const statsRef = useRef<RenderStats>({ renders: 0, lastRender: 0, averageRenderTime: 0 })
  const renderStartTime = useRef<number>(0)

  // Medir tiempo de renderizado
  const measureRenderStart = useCallback(() => {
    renderStartTime.current = performance.now()
  }, [])

  const measureRenderEnd = useCallback(() => {
    if (renderStartTime.current === 0) return

    const renderTime = performance.now() - renderStartTime.current
    const stats = statsRef.current
    
    stats.renders++
    stats.lastRender = renderTime
    stats.averageRenderTime = (stats.averageRenderTime * (stats.renders - 1) + renderTime) / stats.renders

    if (componentName) {
      renderStatsMap.set(componentName, { ...stats })
      
      // Log renders lentos
      if (renderTime > 16) { // 60fps = 16ms per frame
        logger.warn('Slow render detected', {
          component: componentName,
          renderTime: `${renderTime.toFixed(2)}ms`,
          totalRenders: stats.renders
        })
      }
    }

    renderStartTime.current = 0
  }, [componentName, logger])

  return {
    measureRenderStart,
    measureRenderEnd,
    getRenderStats: () => statsRef.current
  }
}

// Hook para prevenir re-renders innecesarios
export function useStableFunctions<T extends Record<string, (...args: any[]) => any>>(
  functions: T
): T {
  const stableFunctionsRef = useRef<T | null>(null)

  if (!stableFunctionsRef.current) {
    const stable = {} as T
    for (const [key, fn] of Object.entries(functions)) {
      stable[key as keyof T] = ((...args: any[]) => fn(...args)) as T[keyof T]
    }
    stableFunctionsRef.current = stable
  }

  return stableFunctionsRef.current
}

// Hook para callbacks optimizados con dependencias complejas
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  debugName?: string
): T {
  const logger = useLogger('OptimizedCallback')
  const callbackRef = useRef<T>(callback)

  // Update the ref when deps change
  const memoizedCallback = useCallback((...args: any[]) => {
    return callbackRef.current(...args)
  }, deps) as T

  // Track the latest callback
  callbackRef.current = callback

  if (debugName) {
    logger.debug(`Callback: ${debugName}`, { depsLength: deps.length })
  }

  return memoizedCallback
}

// Hook para valores memoizados con invalidación inteligente
export function useSmartMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  options: {
    debugName?: string
    maxAge?: number // ms
    deepEqual?: boolean
  } = {}
): T {
  const { debugName, maxAge = 5000, deepEqual = false } = options
  const logger = useLogger('SmartMemo')
  const cacheRef = useRef<{ value: T; timestamp: number; deps: React.DependencyList }>()

  return useMemo(() => {
    const now = Date.now()
    const cached = cacheRef.current

    // Verificar si el cache es válido
    if (cached) {
      const isExpired = maxAge > 0 && (now - cached.timestamp) > maxAge
      const depsChanged = !deepEqual 
        ? deps.some((dep, index) => dep !== cached.deps[index])
        : JSON.stringify(deps) !== JSON.stringify(cached.deps)

      if (!isExpired && !depsChanged) {
        if (debugName) {
          logger.debug(`Cache hit: ${debugName}`)
        }
        return cached.value
      }
    }

    // Recalcular valor
    const startTime = performance.now()
    const value = factory()
    const computationTime = performance.now() - startTime

    if (debugName && computationTime > 5) {
      logger.debug(`Expensive computation: ${debugName}`, {
        computationTime: `${computationTime.toFixed(2)}ms`
      })
    }

    cacheRef.current = { value, timestamp: now, deps }
    return value
  }, deps)
}

// Obtener estadísticas de renderizado globales
export function getRenderStats(componentName?: string): RenderStats | Map<string, RenderStats> {
  if (componentName) {
    return renderStatsMap.get(componentName) || { renders: 0, lastRender: 0, averageRenderTime: 0 }
  }
  return new Map(renderStatsMap)
}

// Limpiar estadísticas de renderizado
export function clearRenderStats(componentName?: string): void {
  if (componentName) {
    renderStatsMap.delete(componentName)
  } else {
    renderStatsMap.clear()
  }
}