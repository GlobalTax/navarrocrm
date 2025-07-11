import { useEffect, useRef } from 'react'

type CleanupFunction = () => void
type EffectFunction = () => CleanupFunction | void

export const useCleanupEffect = (effect: EffectFunction, deps?: React.DependencyList) => {
  const cleanupRef = useRef<CleanupFunction>()

  useEffect(() => {
    // Execute the effect
    const cleanup = effect()
    
    // Store cleanup function
    if (typeof cleanup === 'function') {
      cleanupRef.current = cleanup
    }

    // Return cleanup that calls stored cleanup
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = undefined
      }
    }
  }, deps)

  // Manual cleanup
  const manualCleanup = () => {
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = undefined
    }
  }

  return { cleanup: manualCleanup }
}