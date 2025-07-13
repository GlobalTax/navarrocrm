import { useMemo, useRef } from 'react'
import { useLogger } from './useLogger'

interface MemoStats {
  computations: number
  cacheHits: number
  lastComputed: number
}

const memoStatsMap = new Map<string, MemoStats>()

export function useOptimizedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  debugKey?: string
): T {
  const logger = useLogger('useOptimizedMemo')
  const statsRef = useRef<MemoStats>({
    computations: 0,
    cacheHits: 0,
    lastComputed: 0
  })

  const result = useMemo(() => {
    const startTime = performance.now()
    
    try {
      const value = factory()
      const endTime = performance.now()
      const computationTime = endTime - startTime

      // Actualizar estadísticas
      statsRef.current.computations++
      statsRef.current.lastComputed = endTime

      if (debugKey) {
        memoStatsMap.set(debugKey, { ...statsRef.current })
        
        if (computationTime > 5) { // Log si toma más de 5ms
          logger.debug(`Memo computation: ${debugKey}`, {
            computationTime: `${computationTime.toFixed(2)}ms`,
            totalComputations: statsRef.current.computations
          })
        }
      }

      return value
    } catch (error) {
      logger.error('Memo computation failed', { error, debugKey })
      throw error
    }
  }, deps)

  // Incrementar cache hits cuando no se recomputa
  const prevDepsRef = useRef(deps)
  if (prevDepsRef.current !== deps) {
    prevDepsRef.current = deps
  } else {
    statsRef.current.cacheHits++
    if (debugKey) {
      memoStatsMap.set(debugKey, { ...statsRef.current })
    }
  }

  return result
}

// Hook para memoización con comparación personalizada
export function useOptimizedMemoWithComparison<T>(
  factory: () => T,
  deps: React.DependencyList,
  compareFn: (prev: React.DependencyList, next: React.DependencyList) => boolean,
  debugKey?: string
): T {
  const logger = useLogger('useOptimizedMemoWithComparison')
  const prevDepsRef = useRef<React.DependencyList>([])
  const cachedValueRef = useRef<T>()
  const isFirstRender = useRef(true)

  if (isFirstRender.current || !compareFn(prevDepsRef.current, deps)) {
    const startTime = performance.now()
    
    try {
      cachedValueRef.current = factory()
      const computationTime = performance.now() - startTime
      
      if (debugKey && computationTime > 5) {
        logger.debug(`Custom memo computation: ${debugKey}`, {
          computationTime: `${computationTime.toFixed(2)}ms`
        })
      }
    } catch (error) {
      logger.error('Custom memo computation failed', { error, debugKey })
      throw error
    }

    prevDepsRef.current = deps
    isFirstRender.current = false
  }

  return cachedValueRef.current!
}

// Función para obtener estadísticas de memoización
export function getMemoStats(debugKey?: string): MemoStats | Map<string, MemoStats> {
  if (debugKey) {
    return memoStatsMap.get(debugKey) || { computations: 0, cacheHits: 0, lastComputed: 0 }
  }
  return new Map(memoStatsMap)
}

// Función para limpiar estadísticas
export function clearMemoStats(debugKey?: string): void {
  if (debugKey) {
    memoStatsMap.delete(debugKey)
  } else {
    memoStatsMap.clear()
  }
}