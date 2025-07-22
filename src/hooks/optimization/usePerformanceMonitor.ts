
import { useEffect, useRef, useState } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface PerformanceMetrics {
  componentRenders: number
  avgRenderTime: number
  memoryUsage: number
  slowRenders: number
  lastSlowRender: number
}

export const usePerformanceMonitor = (componentName: string, threshold = 16) => {
  const logger = useLogger('PerformanceMonitor')
  const renderCountRef = useRef(0)
  const renderTimesRef = useRef<number[]>([])
  const lastRenderTime = useRef(Date.now())
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    componentRenders: 0,
    avgRenderTime: 0,
    memoryUsage: 0,
    slowRenders: 0,
    lastSlowRender: 0
  })

  useEffect(() => {
    const startTime = performance.now()
    renderCountRef.current++

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      renderTimesRef.current.push(renderTime)
      
      // Mantener solo las últimas 100 mediciones
      if (renderTimesRef.current.length > 100) {
        renderTimesRef.current = renderTimesRef.current.slice(-100)
      }

      // Detectar renders lentos
      if (renderTime > threshold) {
        logger.warn(`Slow render detected in ${componentName}`, {
          renderTime: renderTime.toFixed(2),
          threshold: threshold
        })
      }

      // Actualizar métricas cada 10 renders
      if (renderCountRef.current % 10 === 0) {
        const avgRenderTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length
        const slowRenders = renderTimesRef.current.filter(time => time > threshold).length
        
        // Obtener uso de memoria si está disponible
        const memoryUsage = (performance as any).memory ? 
          (performance as any).memory.usedJSHeapSize / 1024 / 1024 : 0

        setMetrics({
          componentRenders: renderCountRef.current,
          avgRenderTime,
          memoryUsage,
          slowRenders,
          lastSlowRender: renderTime
        })
      }
    }
  })

  // Función para obtener métricas actuales
  const getCurrentMetrics = () => ({
    ...metrics,
    renderTimes: [...renderTimesRef.current]
  })

  // Función para resetear métricas
  const resetMetrics = () => {
    renderCountRef.current = 0
    renderTimesRef.current = []
    setMetrics({
      componentRenders: 0,
      avgRenderTime: 0,
      memoryUsage: 0,
      slowRenders: 0,
      lastSlowRender: 0
    })
    logger.info(`Performance metrics reset for ${componentName}`)
  }

  return {
    metrics,
    getCurrentMetrics,
    resetMetrics,
    isPerformant: metrics.avgRenderTime < threshold && metrics.slowRenders < 5
  }
}
