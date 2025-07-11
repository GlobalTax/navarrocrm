import { useEffect, useRef, useCallback } from 'react'

export const useTimeout = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the timeout
  useEffect(() => {
    if (delay === null) return

    const tick = () => savedCallback.current()
    
    timeoutRef.current = setTimeout(tick, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [delay])

  // Clear timeout manually
  const clearTimeoutManual = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
  }, [])

  return { clearTimeout: clearTimeoutManual }
}