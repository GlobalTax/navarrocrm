import { useState, useEffect } from 'react'
import { useIntersectionObserver } from './useIntersectionObserver'
import { useLogger } from '@/hooks/useLogger'

interface UseLazyRenderOptions {
  threshold?: number
  rootMargin?: string
  fallback?: React.ReactNode
  delay?: number
}

interface UseLazyRenderReturn {
  shouldRender: boolean
  containerRef: React.RefObject<HTMLDivElement>
  isVisible: boolean
}

export function useLazyRender({
  threshold = 0.1,
  rootMargin = '50px',
  delay = 0
}: UseLazyRenderOptions = {}): UseLazyRenderReturn {
  const logger = useLogger('LazyRender')
  const [shouldRender, setShouldRender] = useState(false)
  const { targetRef: containerRef, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    once: true
  })

  useEffect(() => {
    if (isIntersecting && !shouldRender) {
      if (delay > 0) {
        const timer = setTimeout(() => {
          setShouldRender(true)
          logger.info('⏰ Renderizado lazy activado', { delay })
        }, delay)
        
        return () => clearTimeout(timer)
      } else {
        setShouldRender(true)
        logger.info('⚡ Renderizado lazy activado')
      }
    }
  }, [isIntersecting, shouldRender, delay, logger])

  return {
    shouldRender,
    containerRef,
    isVisible: isIntersecting
  }
}