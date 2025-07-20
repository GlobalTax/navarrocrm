
import React, { Suspense } from 'react'
import { LazyComponentBoundary } from '@/components/error-boundaries/LazyComponentBoundary'
import { QueryErrorBoundary } from '@/components/error-boundaries/QueryErrorBoundary'
import { Skeleton } from '@/components/ui/skeleton'
import { useLogger } from '@/hooks/useLogger'
import { useTelemetry } from '@/components/monitoring/TelemetryProvider'

interface LazyRouteWrapperProps {
  children: React.ReactNode
  routeName: string
  fallback?: React.ReactNode
}

const DefaultFallback = ({ routeName }: { routeName: string }) => (
  <div className="container mx-auto p-6 space-y-4">
    <div className="flex items-center gap-4 mb-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-6 w-24" />
    </div>
    <div className="grid gap-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
    <div className="text-center text-sm text-muted-foreground mt-4">
      Cargando {routeName}...
    </div>
  </div>
)

export const LazyRouteWrapper: React.FC<LazyRouteWrapperProps> = ({
  children,
  routeName,
  fallback
}) => {
  const logger = useLogger(`Route-${routeName}`)
  const { trackPageView } = useTelemetry()

  React.useEffect(() => {
    logger.debug(`Route ${routeName} mounted`)
    trackPageView(`/${routeName.toLowerCase()}`)
    
    return () => {
      logger.debug(`Route ${routeName} unmounted`)
    }
  }, [routeName, logger, trackPageView])

  const renderFallback = fallback || <DefaultFallback routeName={routeName} />

  return (
    <QueryErrorBoundary queryKey={[`route-${routeName.toLowerCase()}`]}>
      <LazyComponentBoundary 
        componentName={routeName}
        onRetry={() => {
          logger.info(`Retrying route ${routeName}`)
          window.location.reload()
        }}
      >
        <Suspense fallback={renderFallback}>
          {children}
        </Suspense>
      </LazyComponentBoundary>
    </QueryErrorBoundary>
  )
}
