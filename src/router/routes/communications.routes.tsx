import { Suspense } from 'react'
import { RouteConfig } from '../types'
import { createOptimizedLazy, RoutePriority } from '@/utils/routeOptimizer'
import { CommunicationFeatureBoundary } from '@/components/routing/FeatureBoundary'
import { Skeleton } from '@/components/ui/skeleton'

// MEDIUM PRIORITY - Communication Bundle
const Emails = createOptimizedLazy(
  () => import('@/pages/Emails'),
  RoutePriority.MEDIUM
)
const Calendar = createOptimizedLazy(
  () => import('@/pages/Calendar'),
  RoutePriority.MEDIUM
)

// Communications loading skeleton
const CommunicationsSkeleton = () => (
  <div className="p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-28" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1">
        <Skeleton className="h-80" />
      </div>
      <div className="lg:col-span-2">
        <Skeleton className="h-80" />
      </div>
    </div>
  </div>
)

export const communicationRoutes: RouteConfig[] = [
  {
    path: '/emails/*',
    element: (
      <Suspense fallback={<CommunicationsSkeleton />}>
        <CommunicationFeatureBoundary>
          <Emails />
        </CommunicationFeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/calendar',
    element: (
      <Suspense fallback={<CommunicationsSkeleton />}>
        <CommunicationFeatureBoundary>
          <Calendar />
        </CommunicationFeatureBoundary>
      </Suspense>
    )
  }
]