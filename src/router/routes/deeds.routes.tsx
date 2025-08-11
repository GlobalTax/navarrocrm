import { Suspense } from 'react'
import { RouteConfig } from '../types'
import { createOptimizedLazy, RoutePriority } from '@/utils/routeOptimizer'
import { FeatureBoundary } from '@/components/routing/FeatureBoundary'
import { Skeleton } from '@/components/ui/skeleton'

// HIGH or MEDIUM priority - we'll use MEDIUM for Escrituras
const Deeds = createOptimizedLazy(
  () => import('@/pages/Deeds'),
  RoutePriority.MEDIUM
)

const DeedsSkeleton = () => (
  <div className="p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-28" />
    </div>
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  </div>
)

export const deedsRoutes: RouteConfig[] = [
  {
    path: '/escrituras',
    element: (
      <Suspense fallback={<DeedsSkeleton />}> 
        <FeatureBoundary feature="Escrituras Públicas">
          <Deeds />
        </FeatureBoundary>
      </Suspense>
    )
  }
]
