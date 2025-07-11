import { useEffect, useRef, useCallback } from 'react'

export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback)
  const intervalRef = useRef<NodeJS.Timeout>()

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval
  useEffect(() => {
    if (delay === null) return

    const tick = () => savedCallback.current()
    
    intervalRef.current = setInterval(tick, delay)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [delay])

  // Clear interval manually
  const clearIntervalManual = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }
  }, [])

  return { clearInterval: clearIntervalManual }
}