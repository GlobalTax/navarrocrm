import React, { Suspense, lazy } from 'react'
import { useAdvancedPerformanceMonitor } from '@/hooks/performance/useAdvancedPerformanceMonitor'

interface PerformanceOptimizedWrapperProps {
  children: React.ReactNode
  componentName: string
  threshold?: number
  enableMonitoring?: boolean
}

export const PerformanceOptimizedWrapper = React.memo<PerformanceOptimizedWrapperProps>(
  ({ children, componentName, threshold = 16.67, enableMonitoring = true }) => {
    const { metrics, isHealthy } = useAdvancedPerformanceMonitor(
      enableMonitoring ? componentName : ''
    )

    // Show performance warning in development
    if (process.env.NODE_ENV === 'development' && !isHealthy) {
      console.warn(`⚠️ Performance Warning: ${componentName} might need optimization`, {
        avgRenderTime: metrics.avgRenderTime,
        memoryUsage: metrics.memoryUsage
      })
    }

    return (
      <div data-component={componentName} data-render-count={metrics.renderCount}>
        {children}
      </div>
    )
  }
)

PerformanceOptimizedWrapper.displayName = 'PerformanceOptimizedWrapper'

// HOC for easy component wrapping
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  const WrappedComponent = React.memo((props: P) => (
    <PerformanceOptimizedWrapper componentName={componentName}>
      <Component {...props} />
    </PerformanceOptimizedWrapper>
  ))

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName})`
  return WrappedComponent
}

// Lazy loading with performance monitoring
export const createLazyComponent = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>,
  componentName: string
) => {
  const LazyComponent = lazy(importFunc)
  
  return React.memo((props: any) => (
    <PerformanceOptimizedWrapper componentName={componentName}>
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-8 rounded" />}>
        <LazyComponent {...props} />
      </Suspense>
    </PerformanceOptimizedWrapper>
  ))
}