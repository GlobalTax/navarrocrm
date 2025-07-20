import { useEffect, useRef, useState } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  rootMargin?: string
  root?: Element | null
  once?: boolean
}

interface UseIntersectionObserverReturn {
  targetRef: React.RefObject<HTMLDivElement>
  isIntersecting: boolean
  entry: IntersectionObserverEntry | null
}

export function useIntersectionObserver({
  threshold = 0,
  rootMargin = '0px',
  root = null,
  once = false
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverReturn {
  const logger = useLogger('IntersectionObserver')
  const targetRef = useRef<HTMLDivElement>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    const element = targetRef.current
    if (!element) return

    // Don't observe if already triggered and once is true
    if (once && hasTriggered) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        setEntry(entry)
        setIsIntersecting(entry.isIntersecting)

        if (entry.isIntersecting) {
          logger.info('👁️ Elemento visible', {
            intersectionRatio: entry.intersectionRatio.toFixed(2)
          })
          
          if (once) {
            setHasTriggered(true)
          }
        }
      },
      {
        threshold,
        rootMargin,
        root
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, root, once, hasTriggered, logger])

  return { targetRef, isIntersecting, entry }
}