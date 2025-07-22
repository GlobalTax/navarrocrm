
import { useEffect, useRef, useState } from 'react'
import { useLogger } from '@/hooks/useLogger'

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
  const logger = useLogger('PerformanceMonitor')

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

        // Log performance warnings usando el logger centralizado
        if (renderTime > 16.67) { // More than one frame at 60fps
          logger.warn(`Slow render detected in ${componentName}`, {
            component: 'PerformanceMonitor',
            renderTime: renderTime.toFixed(2),
            threshold: 16
          })
        }
        
        if (avgRenderTime > 10) {
          logger.warn(`High average render time in ${componentName}`, {
            component: 'PerformanceMonitor',
            avgRenderTime: avgRenderTime.toFixed(2),
            threshold: 10
          })
        }
      }
    }
  }, [componentName, isDevMode, logger]) // Agregamos logger a las dependencias

  const logMetrics = () => {
    if (!isDevMode) return
    
    logger.debug(`Performance Metrics for ${componentName}`, {
      renderCount: metrics.renderCount,
      lastRenderTime: `${metrics.lastRenderTime.toFixed(2)}ms`,
      avgRenderTime: `${metrics.avgRenderTime.toFixed(2)}ms`,
      memoryUsage: metrics.memoryUsage ? `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB` : 'N/A'
    })
  }

  return { metrics, logMetrics }
}
