
import { useEffect, useState, useCallback, useRef } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface WebVitalsMetrics {
  fcp: number | null
  lcp: number | null
  fid: number | null
  cls: number | null
  ttfb: number | null
  inp: number | null
}

interface PerformanceThresholds {
  fcp: { good: 1800, poor: 3000 }
  lcp: { good: 2500, poor: 4000 }
  fid: { good: 100, poor: 300 }
  cls: { good: 0.1, poor: 0.25 }
  ttfb: { good: 800, poor: 1800 }
  inp: { good: 200, poor: 500 }
}

const THRESHOLDS: PerformanceThresholds = {
  fcp: { good: 1800, poor: 3000 },
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  ttfb: { good: 800, poor: 1800 },
  inp: { good: 200, poor: 500 }
}

export const useWebVitals = () => {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    inp: null
  })
  
  const [scores, setScores] = useState<Record<string, 'good' | 'needs-improvement' | 'poor'>>({})
  const logger = useLogger('WebVitals')
  const updateTimeoutRef = useRef<NodeJS.Timeout>()

  const getScore = useCallback((metric: keyof WebVitalsMetrics, value: number) => {
    const threshold = THRESHOLDS[metric]
    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }, [])

  const updateMetric = useCallback((name: keyof WebVitalsMetrics, value: number) => {
    // Clear any pending update
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    // Debounce updates to prevent excessive state changes
    updateTimeoutRef.current = setTimeout(() => {
      setMetrics(prev => {
        // Only update if value has actually changed
        if (prev[name] === value) return prev
        return { ...prev, [name]: value }
      })
      
      const score = getScore(name, value)
      setScores(prev => {
        // Only update if score has changed
        if (prev[name] === score) return prev
        return { ...prev, [name]: score }
      })
      
      logger.info(`📊 Web Vital: ${name.toUpperCase()}`, {
        value: Math.round(value),
        score,
        threshold: THRESHOLDS[name].poor
      })

      // Alert for poor scores
      if (score === 'poor') {
        logger.warn(`⚠️ Poor ${name.toUpperCase()} score`, {
          value: Math.round(value),
          threshold: THRESHOLDS[name].poor
        })
      }
    }, 100) // 100ms debounce
  }, [getScore, logger])

  useEffect(() => {
    const observers: PerformanceObserver[] = []

    try {
      // First Contentful Paint
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            updateMetric('fcp', entry.startTime)
          }
        }
      })
      paintObserver.observe({ entryTypes: ['paint'] })
      observers.push(paintObserver)

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        updateMetric('lcp', lastEntry.startTime)
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      observers.push(lcpObserver)

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          updateMetric('fid', (entry as any).processingStart - entry.startTime)
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
      observers.push(fidObserver)

      // Cumulative Layout Shift
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
            updateMetric('cls', clsValue)
          }
        }
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      observers.push(clsObserver)

      // Time to First Byte
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigationEntry) {
        updateMetric('ttfb', navigationEntry.responseStart - navigationEntry.requestStart)
      }

      // Interaction to Next Paint (modern browsers)
      if ('PerformanceEventTiming' in window) {
        const inpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const inp = (entry as any).processingStart - entry.startTime
            updateMetric('inp', inp)
          }
        })
        inpObserver.observe({ entryTypes: ['event'] })
        observers.push(inpObserver)
      }
    } catch (error) {
      logger.error('Error setting up performance observers', { error })
    }

    return () => {
      observers.forEach(observer => {
        try {
          observer.disconnect()
        } catch (error) {
          logger.warn('Error disconnecting observer', { error })
        }
      })
      
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [updateMetric, logger])

  const getOverallScore = useCallback(() => {
    const scoreValues = Object.values(scores)
    if (scoreValues.length === 0) return 'unknown'
    
    const poorCount = scoreValues.filter(s => s === 'poor').length
    const goodCount = scoreValues.filter(s => s === 'good').length
    
    if (poorCount > 0) return 'poor'
    if (goodCount === scoreValues.length) return 'good'
    return 'needs-improvement'
  }, [scores])

  return {
    metrics,
    scores,
    overallScore: getOverallScore(),
    thresholds: THRESHOLDS
  }
}
