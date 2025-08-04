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
  const [isVisible, setIsVisible] = useState(delay === 0)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Si delay es 0, cargar inmediatamente sin intersection observer
    if (delay === 0) {
      setIsVisible(true)
      return
    }

    // Para delay > 0, usar timer + intersection observer
    const timer = setTimeout(() => {
      if (!elementRef.current) {
        setIsVisible(true)
        return
      }

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
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, rootMargin, threshold])

  return {
    elementRef,
    shouldLoad: isVisible,
    isInViewport: isVisible
  }
}