import React, { Suspense } from 'react'
import { LazyComponentBoundary } from '@/components/error-boundaries/LazyComponentBoundary'
import { useMemoryTracker } from '@/hooks/performance/useMemoryTracker'
import { Skeleton } from '@/components/ui/skeleton'

interface LazyRouteWrapperProps {
  children: React.ReactNode
  routeName: string
  fallback?: React.ReactNode
}

const DefaultFallback = () => (
  <div className="p-6 space-y-4">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-64 w-full" />
  </div>
)

export const LazyRouteWrapper: React.FC<LazyRouteWrapperProps> = ({
  children,
  routeName,
  fallback = <DefaultFallback />
}) => {
  // Track memory usage for this route
  useMemoryTracker(`Route-${routeName}`, 3000)

  return (
    <LazyComponentBoundary
      componentName={`${routeName} Route`}
      onRetry={() => {
        console.log(`🔄 Retrying ${routeName} route`)
        // Could implement route-specific retry logic here
      }}
    >
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </LazyComponentBoundary>
  )
}