import React, { Suspense, lazy, useEffect, useState } from 'react'
import { LazyComponentBoundary } from '@/components/error-boundaries/LazyComponentBoundary'
import { Skeleton } from '@/components/ui/skeleton'
import { usePerformanceMonitor } from '@/hooks/performance/usePerformanceMonitor'

interface LazyLoadingOptimizerProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  componentName?: string
  preload?: boolean
  retryCount?: number
}

// Preloading cache
const preloadCache = new Map<string, Promise<any>>()

// Component cache for already loaded components
const componentCache = new Map<string, React.ComponentType<any>>()

export const LazyLoadingOptimizer: React.FC<LazyLoadingOptimizerProps> = ({
  children,
  fallback,
  componentName = 'LazyComponent',
  preload = false,
  retryCount = 3
}) => {
  const [retries, setRetries] = useState(0)
  const { metrics } = usePerformanceMonitor(`LazyLoader-${componentName}`)

  // Preload component if requested
  useEffect(() => {
    if (preload && componentName && !preloadCache.has(componentName)) {
      const preloadPromise = new Promise((resolve) => {
        // Simulate preloading by setting a short timeout
        setTimeout(resolve, 100)
      })
      preloadCache.set(componentName, preloadPromise)
    }
  }, [preload, componentName])

  const handleRetry = () => {
    if (retries < retryCount) {
      setRetries(prev => prev + 1)
    }
  }

  const defaultFallback = fallback || (
    <div className="space-y-3 p-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )

  return (
    <LazyComponentBoundary
      componentName={componentName}
      onRetry={handleRetry}
    >
      <Suspense fallback={defaultFallback}>
        {children}
      </Suspense>
    </LazyComponentBoundary>
  )
}

// HOC for creating optimized lazy components
export const createOptimizedLazy = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    componentName?: string
    preload?: boolean
    fallback?: React.ReactNode
  } = {}
) => {
  const { componentName = 'LazyComponent', preload = false, fallback } = options

  // Check cache first
  if (componentCache.has(componentName)) {
    return componentCache.get(componentName)!
  }

  const LazyComponent = lazy(() => {
    const importPromise = importFn()
    
    // Cache the component once loaded
    importPromise.then(module => {
      componentCache.set(componentName, module.default)
    })

    return importPromise
  })

  const OptimizedComponent = (props: React.ComponentProps<T>) => (
    <LazyLoadingOptimizer
      componentName={componentName}
      preload={preload}
      fallback={fallback}
    >
      <LazyComponent {...props} />
    </LazyLoadingOptimizer>
  )

  // Cache the optimized component
  componentCache.set(componentName, OptimizedComponent as any)

  return OptimizedComponent
}

// Preload utility for critical components
export const preloadComponent = (
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  componentName: string
) => {
  if (!preloadCache.has(componentName)) {
    const preloadPromise = importFn().then(module => {
      componentCache.set(componentName, module.default)
      return module
    })
    preloadCache.set(componentName, preloadPromise)
  }
  return preloadCache.get(componentName)
}

// Batch preloader for multiple components
export const batchPreload = (components: Array<{
  importFn: () => Promise<{ default: React.ComponentType<any> }>
  name: string
}>) => {
  const promises = components.map(({ importFn, name }) => 
    preloadComponent(importFn, name)
  )
  
  return Promise.all(promises)
}