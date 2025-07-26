import { useState, useEffect, useRef } from 'react'

interface UseLazyComponentOptions {
  delay?: number
  rootMargin?: string
  threshold?: number
}

export const useLazyComponent = ({ 
  delay = 0, 
  rootMargin = '100px',
  threshold = 0.1 
}: UseLazyComponentOptions = {}) => {
  const [shouldLoad, setShouldLoad] = useState(delay === 0)
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShouldLoad(true)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [delay])

  useEffect(() => {
    if (!shouldLoad || !elementRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold }
    )

    observer.observe(elementRef.current)
    return () => observer.disconnect()
  }, [shouldLoad, rootMargin, threshold])

  return {
    elementRef,
    shouldLoad: shouldLoad && (delay > 0 ? true : isVisible),
    isInViewport: isVisible
  }
}