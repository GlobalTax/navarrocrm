import { useEffect, useRef, useState } from 'react'

interface PerformanceMetrics {
  renderCount: number
  lastRenderTime: number
  avgRenderTime: number
  memoryUsage?: number
  componentsRendered: number
}

export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    avgRenderTime: 0,
    componentsRendered: 0
  })
  
  const renderStartTime = useRef<number>()
  const renderTimes = useRef<number[]>([])
  const isDevMode = process.env.NODE_ENV === 'development'

  useEffect(() => {
    if (!isDevMode) return
    
    renderStartTime.current = performance.now()
    
    return () => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current
        renderTimes.current.push(renderTime)
        
        // Keep only last 10 render times
        if (renderTimes.current.length > 10) {
          renderTimes.current.shift()
        }
        
        const avgRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
        
        // Use functional update to avoid dependency issues
        setMetrics(prev => ({
          renderCount: prev.renderCount + 1,
          lastRenderTime: renderTime,
          avgRenderTime,
          memoryUsage: (performance as any).memory?.usedJSHeapSize,
          componentsRendered: prev.componentsRendered + 1
        }))

        // Log performance warnings
        if (renderTime > 16.67) { // More than one frame at 60fps
          console.warn(`🐌 [Performance] ${componentName} render took ${renderTime.toFixed(2)}ms (>16.67ms)`)
        }
        
        if (avgRenderTime > 10) {
          console.warn(`📊 [Performance] ${componentName} avg render time: ${avgRenderTime.toFixed(2)}ms`)
        }
      }
    }
  }, [componentName, isDevMode])

  const logMetrics = () => {
    if (!isDevMode) return
    
    console.group(`📊 [Performance Metrics] ${componentName}`)
    console.log('Render count:', metrics.renderCount)
    console.log('Last render time:', `${metrics.lastRenderTime.toFixed(2)}ms`)
    console.log('Average render time:', `${metrics.avgRenderTime.toFixed(2)}ms`)
    if (metrics.memoryUsage) {
      console.log('Memory usage:', `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`)
    }
    console.groupEnd()
  }

  return { metrics, logMetrics }
}
