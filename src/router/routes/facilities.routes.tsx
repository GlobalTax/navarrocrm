import { Suspense } from 'react'
import { RouteConfig } from '../types'
import { createOptimizedLazy, RoutePriority } from '@/utils/routeOptimizer'
import { FeatureBoundary } from '@/components/routing/FeatureBoundary'
import { Skeleton } from '@/components/ui/skeleton'

// LOW PRIORITY - Facilities Bundle (deferred)
const Rooms = createOptimizedLazy(
  () => import('@/pages/Rooms'),
  RoutePriority.LOW
)
const RoomDisplay = createOptimizedLazy(
  () => import('@/pages/RoomDisplay'),
  RoutePriority.LOW
)
const Equipment = createOptimizedLazy(
  () => import('@/pages/EquipmentPage'),
  RoutePriority.LOW
)

// Facilities loading skeleton
const FacilitiesSkeleton = () => (
  <div className="p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-10 w-28" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-48" />
      ))}
    </div>
  </div>
)

export const facilitiesRoutes: RouteConfig[] = [
  {
    path: '/rooms',
    element: (
      <Suspense fallback={<FacilitiesSkeleton />}>
        <FeatureBoundary feature="Salas">
          <Rooms />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/room-display',
    element: (
      <Suspense fallback={<FacilitiesSkeleton />}>
        <FeatureBoundary feature="Display de Salas">
          <RoomDisplay />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/equipment',
    element: (
      <Suspense fallback={<FacilitiesSkeleton />}>
        <FeatureBoundary feature="Equipamiento">
          <Equipment />
        </FeatureBoundary>
      </Suspense>
    )
  }
]