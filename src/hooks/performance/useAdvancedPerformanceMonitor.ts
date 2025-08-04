import { useEffect, useRef, useState, useCallback } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface ExtendedPerformanceMetrics {
  component: string
  renderCount: number
  lastRenderTime: number
  avgRenderTime: number
  maxRenderTime: number
  memoryUsage: number
  bundleSize?: number
  networkLatency?: number
}

export const useAdvancedPerformanceMonitor = (componentName: string) => {
  const logger = useLogger('AdvancedPerformance')
  const [metrics, setMetrics] = useState<ExtendedPerformanceMetrics>({
    component: componentName,
    renderCount: 0,
    lastRenderTime: 0,
    avgRenderTime: 0,
    maxRenderTime: 0,
    memoryUsage: 0
  })
  
  const renderStartTime = useRef<number>()
  const renderTimes = useRef<number[]>([])
  const isDevMode = process.env.NODE_ENV === 'development'

  // Measure render performance
  useEffect(() => {
    if (!isDevMode) return
    
    renderStartTime.current = performance.now()
    
    return () => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current
        renderTimes.current.push(renderTime)
        
        // Keep only last 20 render times for better average
        if (renderTimes.current.length > 20) {
          renderTimes.current.shift()
        }
        
        const avgRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
        const maxRenderTime = Math.max(...renderTimes.current)
        
        // Get memory usage
        const memory = (performance as any).memory
        const memoryUsage = memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0
        
        setMetrics(prev => ({
          ...prev,
          renderCount: prev.renderCount + 1,
          lastRenderTime: renderTime,
          avgRenderTime,
          maxRenderTime,
          memoryUsage
        }))

        // Performance warnings with thresholds
        if (renderTime > 16.67) {
          logger.warn(`Slow render detected in ${componentName}`, {
            renderTime: renderTime.toFixed(2)
          })
        }
        
        if (avgRenderTime > 10) {
          logger.warn(`High average render time in ${componentName}: ${avgRenderTime.toFixed(2)}ms`)
        }

        if (memoryUsage > 100) {
          logger.warn(`High memory usage in ${componentName}: ${memoryUsage}MB`)
        }
      }
    }
  }, [componentName, isDevMode, logger])

  // Performance report generator
  const generateReport = useCallback(() => {
    const report = {
      component: componentName,
      performance: {
        renderCount: metrics.renderCount,
        averageRenderTime: `${metrics.avgRenderTime.toFixed(2)}ms`,
        maxRenderTime: `${metrics.maxRenderTime.toFixed(2)}ms`,
        memoryUsage: `${metrics.memoryUsage}MB`
      },
      recommendations: []
    }

    // Add performance recommendations
    const recommendations: string[] = []
    
    if (metrics.avgRenderTime > 10) {
      recommendations.push('Consider memoizing expensive calculations with useMemo')
    }
    
    if (metrics.renderCount > 50 && metrics.avgRenderTime > 5) {
      recommendations.push('Component renders frequently - consider React.memo')
    }
    
    if (metrics.memoryUsage > 100) {
      recommendations.push('High memory usage - check for memory leaks')
    }

    if (metrics.maxRenderTime > 50) {
      recommendations.push('Consider code splitting or lazy loading')
    }

    report.recommendations = recommendations
    
    logger.info(`Performance report for ${componentName}`, { metadata: report })
    return report
  }, [componentName, metrics, logger])

  return {
    metrics,
    generateReport,
    isHealthy: metrics.avgRenderTime < 10 && metrics.memoryUsage < 100
  }
}
