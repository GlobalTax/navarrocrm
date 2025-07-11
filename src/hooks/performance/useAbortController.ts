import { useRef, useEffect, useCallback } from 'react'

export const useAbortController = () => {
  const abortControllerRef = useRef<AbortController>()

  // Create new AbortController
  const getController = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    return abortControllerRef.current
  }, [])

  // Get current signal
  const getSignal = useCallback(() => {
    if (!abortControllerRef.current) {
      abortControllerRef.current = new AbortController()
    }
    return abortControllerRef.current.signal
  }, [])

  // Abort current controller
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = undefined
    }
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return { getController, getSignal, abort }
}