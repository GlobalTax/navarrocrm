/**
 * Performance optimization utilities for memoization
 */

import { useRef, useMemo } from 'react'

/**
 * Custom hook for deep comparison memoization
 * Use when you need to memoize based on object content rather than reference
 */
export const useDeepMemo = <T>(factory: () => T, deps: any[]): T => {
  const ref = useRef<{ deps: any[], value: T }>()
  
  const depsChanged = !ref.current || 
    deps.length !== ref.current.deps.length ||
    deps.some((dep, i) => !deepEqual(dep, ref.current!.deps[i]))
  
  if (depsChanged) {
    ref.current = {
      deps,
      value: factory()
    }
  }
  
  return ref.current.value
}

/**
 * Shallow comparison for simple object memoization
 */
export const useShallowMemo = <T>(factory: () => T, deps: Record<string, any>): T => {
  const depsArray = Object.keys(deps).sort().map(key => deps[key])
  return useMemo(factory, depsArray)
}

/**
 * Deep equality check for objects and arrays
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  
  if (a == null || b == null) return false
  
  if (typeof a !== typeof b) return false
  
  if (typeof a !== 'object') return false
  
  if (Array.isArray(a) !== Array.isArray(b)) return false
  
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!deepEqual(a[key], b[key])) return false
  }
  
  return true
}

/**
 * Debounce hook for performance optimization
 */
export const useDebounce = <T>(value: T, delay: number): T => {
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

// Missing import
import { useState, useEffect } from 'react'