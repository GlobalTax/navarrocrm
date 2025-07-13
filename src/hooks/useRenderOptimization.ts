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
  const stableFunctions = useRef<T>()
  
  return useMemo(() => {
    if (!stableFunctions.current) {
      stableFunctions.current = {} as T
      
      for (const [key, fn] of Object.entries(functions)) {
        stableFunctions.current[key as keyof T] = useCallback(fn, []) as T[keyof T]
      }
    }
    
    return stableFunctions.current
  }, [])
}

// Hook para callbacks optimizados con dependencias complejas
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  debugName?: string
): T {
  const logger = useLogger('OptimizedCallback')
  const prevDepsRef = useRef<React.DependencyList>()
  const callbackRef = useRef<T>()

  return useMemo(() => {
    const depsChanged = !prevDepsRef.current || 
      deps.some((dep, index) => dep !== prevDepsRef.current![index])

    if (depsChanged) {
      if (debugName && prevDepsRef.current) {
        logger.debug(`Callback recreated: ${debugName}`, {
          depsLength: deps.length,
          recreationCount: (callbackRef.current as any)?._recreations || 1
        })
      }
      
      const newCallback = useCallback(callback, deps) as T
      ;(newCallback as any)._recreations = ((callbackRef.current as any)?._recreations || 0) + 1
      
      callbackRef.current = newCallback
      prevDepsRef.current = deps
    }

    return callbackRef.current!
  }, deps)
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