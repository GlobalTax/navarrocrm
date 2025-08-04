import { useEffect, useRef, useState } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface CoreWebVitals {
  FCP?: number  // First Contentful Paint
  LCP?: number  // Largest Contentful Paint
  FID?: number  // First Input Delay
  CLS?: number  // Cumulative Layout Shift
  TTFB?: number // Time to First Byte
}

interface PerformanceBudget {
  maxBundleSize: number // MB
  maxLoadTime: number   // ms
  maxMemoryUsage: number // MB
  maxLCP: number        // ms
  maxFID: number        // ms
  maxCLS: number        // score
}

const DEFAULT_BUDGET: PerformanceBudget = {
  maxBundleSize: 2,     // 2MB
  maxLoadTime: 3000,    // 3s
  maxMemoryUsage: 50,   // 50MB
  maxLCP: 2500,         // 2.5s
  maxFID: 100,          // 100ms
  maxCLS: 0.1           // 0.1 score
}

export const usePerformanceBudget = (budget: Partial<PerformanceBudget> = {}) => {
  const logger = useLogger('PerformanceBudget')
  const [vitals, setVitals] = useState<CoreWebVitals>({})
  const [violations, setViolations] = useState<string[]>([])
  const observerRef = useRef<PerformanceObserver>()
  
  const fullBudget = { ...DEFAULT_BUDGET, ...budget }

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Observe Core Web Vitals
    const observeWebVitals = () => {
      try {
        // LCP Observer
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          
          if (lastEntry) {
            const lcp = lastEntry.startTime
            setVitals(prev => ({ ...prev, LCP: lcp }))
            
            if (lcp > fullBudget.maxLCP) {
              const violation = `LCP violation: ${lcp.toFixed(0)}ms > ${fullBudget.maxLCP}ms`
              setViolations(prev => [...prev, violation])
              logger.warn(violation)
            }
          }
        })
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // FCP Observer
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          
          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              const fcp = entry.startTime
              setVitals(prev => ({ ...prev, FCP: fcp }))
              logger.info(`FCP: ${fcp.toFixed(0)}ms`)
            }
          })
        })
        
        fcpObserver.observe({ entryTypes: ['paint'] })

        // CLS Observer
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          
          if (clsValue > 0) {
            setVitals(prev => ({ ...prev, CLS: clsValue }))
            
            if (clsValue > fullBudget.maxCLS) {
              const violation = `CLS violation: ${clsValue.toFixed(3)} > ${fullBudget.maxCLS}`
              setViolations(prev => [...prev, violation])
              logger.warn(violation)
            }
          }
        })
        
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        observerRef.current = lcpObserver // Store one for cleanup

      } catch (error) {
        logger.error('Error setting up performance observers', { error })
      }
    }

    // Monitor bundle size and load time
    const checkBudgets = () => {
      // Check navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart
        const ttfb = navigation.responseStart - navigation.fetchStart
        
        setVitals(prev => ({ ...prev, TTFB: ttfb }))
        
        if (loadTime > fullBudget.maxLoadTime) {
          const violation = `Load time violation: ${loadTime.toFixed(0)}ms > ${fullBudget.maxLoadTime}ms`
          setViolations(prev => [...prev, violation])
          logger.warn(violation)
        }
      }

      // Check memory usage
      const performanceAPI = window.performance as any
      if (performanceAPI?.memory) {
        const memoryMB = performanceAPI.memory.usedJSHeapSize / 1024 / 1024
        
        if (memoryMB > fullBudget.maxMemoryUsage) {
          const violation = `Memory violation: ${memoryMB.toFixed(1)}MB > ${fullBudget.maxMemoryUsage}MB`
          setViolations(prev => [...prev, violation])
          logger.warn(violation)
        }
      }
    }

    // Start monitoring
    observeWebVitals()
    
    // Check budgets after load
    if (document.readyState === 'complete') {
      checkBudgets()
    } else {
      window.addEventListener('load', checkBudgets)
    }

    return () => {
      observerRef.current?.disconnect()
      window.removeEventListener('load', checkBudgets)
    }
  }, [fullBudget, logger])

  const generateReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      vitals,
      violations,
      budget: fullBudget,
      score: calculatePerformanceScore()
    }

    logger.info('Performance Budget Report', { metadata: report })
    return report
  }

  const calculatePerformanceScore = (): number => {
    let score = 100
    
    // Deduct points for violations
    violations.forEach(violation => {
      if (violation.includes('LCP')) score -= 20
      if (violation.includes('FID')) score -= 15
      if (violation.includes('CLS')) score -= 15
      if (violation.includes('Load time')) score -= 25
      if (violation.includes('Memory')) score -= 10
    })

    return Math.max(0, score)
  }

  return {
    vitals,
    violations,
    score: calculatePerformanceScore(),
    generateReport,
    isHealthy: violations.length === 0
  }
}