import { Suspense } from 'react'
import { RouteConfig } from '../types'
import { createOptimizedLazy, RoutePriority } from '@/utils/routeOptimizer'
import { AdminFeatureBoundary, FeatureBoundary } from '@/components/routing/FeatureBoundary'
import { Skeleton } from '@/components/ui/skeleton'

// LOW PRIORITY - Integration Bundle (deferred)
const IntegrationSettings = createOptimizedLazy(
  () => import('@/pages/IntegrationSettings'),
  RoutePriority.LOW
)
const QuantumPage = createOptimizedLazy(
  () => import('@/pages/QuantumPage'),
  RoutePriority.LOW
)
const QuantumImport = createOptimizedLazy(
  () => import('@/pages/QuantumImport'),
  RoutePriority.LOW
)
const QuantumBilling = createOptimizedLazy(
  () => import('@/pages/QuantumBilling'),
  RoutePriority.LOW
)

// Integrations loading skeleton
const IntegrationsSkeleton = () => (
  <div className="p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-36" />
      ))}
    </div>
  </div>
)

export const integrationRoutes: RouteConfig[] = [
  {
    path: '/integrations',
    element: (
      <Suspense fallback={<IntegrationsSkeleton />}>
        <AdminFeatureBoundary>
          <IntegrationSettings />
        </AdminFeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/quantum',
    element: (
      <Suspense fallback={<IntegrationsSkeleton />}>
        <FeatureBoundary feature="Quantum">
          <QuantumPage />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/quantum/import',
    element: (
      <Suspense fallback={<IntegrationsSkeleton />}>
        <FeatureBoundary feature="Quantum Import">
          <QuantumImport />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/quantum/billing',
    element: (
      <Suspense fallback={<IntegrationsSkeleton />}>
        <FeatureBoundary feature="Quantum Billing">
          <QuantumBilling />
        </FeatureBoundary>
      </Suspense>
    )
  }
]