import { Suspense } from 'react'
import { RouteConfig } from '../types'
import { createOptimizedLazy, RoutePriority } from '@/utils/routeOptimizer'
import { FeatureBoundary } from '@/components/routing/FeatureBoundary'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Skeleton } from '@/components/ui/skeleton'

// MEDIUM PRIORITY - Business Tools Bundle
const Proposals = createOptimizedLazy(
  () => import('@/pages/Proposals'),
  RoutePriority.MEDIUM
)
const ProposalDetail = createOptimizedLazy(
  () => import('@/pages/ProposalDetail'),
  RoutePriority.MEDIUM
)
const TimeTracking = createOptimizedLazy(
  () => import('@/pages/TimeTracking'),
  RoutePriority.MEDIUM
)
const Documents = createOptimizedLazy(
  () => import('@/pages/Documents'),
  RoutePriority.MEDIUM
)
const RecurrentFees = createOptimizedLazy(
  () => import('@/pages/RecurrentFees'),
  RoutePriority.MEDIUM
)
// const SubscriptionsPage = createOptimizedLazy(
//   () => import('@/pages/SubscriptionsPage'),
//   RoutePriority.MEDIUM
// )
// const OutgoingSubscriptionsPage = createOptimizedLazy(
//   () => import('@/pages/OutgoingSubscriptionsPage'),
//   RoutePriority.MEDIUM
// )
const ReportsMonthlyServiceHours = createOptimizedLazy(
  () => import('@/pages/ReportsMonthlyServiceHours'),
  RoutePriority.MEDIUM
)
const RecurringServicesDashboard = createOptimizedLazy(
  () => import('@/pages/RecurringServicesDashboard'),
  RoutePriority.MEDIUM
)

// Business loading skeleton
const BusinessSkeleton = () => (
  <div className="p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-10 w-36" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-40" />
      ))}
    </div>
  </div>
)

export const businessRoutes: RouteConfig[] = [
  {
    path: '/proposals',
    element: (
      <Suspense fallback={<BusinessSkeleton />}>
        <FeatureBoundary feature="Propuestas">
          <Proposals />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/proposals/:id',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<BusinessSkeleton />}>
          <FeatureBoundary feature="Propuestas">
            <ProposalDetail />
          </FeatureBoundary>
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: '/time-tracking',
    element: (
      <Suspense fallback={<BusinessSkeleton />}>
        <FeatureBoundary feature="Control de Tiempo">
          <TimeTracking />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/documents',
    element: (
      <Suspense fallback={<BusinessSkeleton />}>
        <FeatureBoundary feature="Documentos">
          <Documents />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/recurring-fees',
    element: (
      <Suspense fallback={<BusinessSkeleton />}>
        <FeatureBoundary feature="Honorarios Recurrentes">
          <RecurrentFees />
        </FeatureBoundary>
      </Suspense>
    )
  },
  // {
  //   path: '/subscriptions',
  //   element: (
  //     <Suspense fallback={<BusinessSkeleton />}>
  //       <FeatureBoundary feature="Suscripciones">
  //         <SubscriptionsPage />
  //       </FeatureBoundary>
  //     </Suspense>
  //   )
  // },
  // {
  //   path: '/outgoing-subscriptions',
  //   element: (
  //     <Suspense fallback={<BusinessSkeleton />}>
  //       <FeatureBoundary feature="Suscripciones Externas">
  //         <OutgoingSubscriptionsPage />
  //       </FeatureBoundary>
  //     </Suspense>
  //   )
  // },
  {
    path: '/reports/monthly-service-hours',
    element: (
      <Suspense fallback={<BusinessSkeleton />}>
        <FeatureBoundary feature="Reportes">
          <ReportsMonthlyServiceHours />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/recurring-services/dashboard',
    element: (
      <Suspense fallback={<BusinessSkeleton />}>
        <FeatureBoundary feature="Servicios Recurrentes">
          <RecurringServicesDashboard />
        </FeatureBoundary>
      </Suspense>
    )
  }
]