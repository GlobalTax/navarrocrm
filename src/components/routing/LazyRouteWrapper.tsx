import React, { Suspense } from 'react'
import { LazyComponentBoundary } from '@/components/error-boundaries/LazyComponentBoundary'
import { useMemoryTracker } from '@/hooks/performance/useMemoryTracker'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface LazyRouteWrapperProps {
  children: React.ReactNode
  routeName: string
  fallback?: React.ReactNode
  priority?: 'critical' | 'high' | 'medium' | 'low'
}

// Fallbacks específicos por prioridad
const PriorityFallbacks = {
  critical: () => (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-lg font-medium">Cargando...</span>
      </div>
    </div>
  ),
  
  high: () => (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-full mb-3" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    </div>
  ),
  
  medium: () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-12 w-12" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  ),
  
  low: () => (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Cargando módulo...</p>
      </div>
      <div className="grid gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  )
}

export const LazyRouteWrapper: React.FC<LazyRouteWrapperProps> = ({
  children,
  routeName,
  fallback,
  priority = 'medium'
}) => {
  // Track memory usage for this route
  useMemoryTracker(`Route-${routeName}`, 3000)

  const DefaultFallback = PriorityFallbacks[priority]

  return (
    <LazyComponentBoundary
      componentName={`${routeName} Route`}
      onRetry={() => {
        console.log(`🔄 Retrying ${routeName} route`)
        // Could implement route-specific retry logic here
      }}
    >
      <Suspense fallback={fallback || <DefaultFallback />}>
        {children}
      </Suspense>
    </LazyComponentBoundary>
  )
}

// HOC para crear rutas lazy optimizadas
export const createLazyRoute = <T extends React.ComponentType<any>>(
  Component: T,
  routeName: string,
  priority: 'critical' | 'high' | 'medium' | 'low' = 'medium'
) => {
  return (props: React.ComponentProps<T>) => (
    <LazyRouteWrapper routeName={routeName} priority={priority}>
      <Component {...props} />
    </LazyRouteWrapper>
  )
}