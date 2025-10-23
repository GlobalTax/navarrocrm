import { Suspense } from 'react'
import { RouteConfig } from '../types'
import { createOptimizedLazy, RoutePriority } from '@/utils/routeOptimizer'
import { AdminFeatureBoundary } from '@/components/routing/FeatureBoundary'
import { FeatureBoundary } from '@/components/routing/FeatureBoundary'
import { Skeleton } from '@/components/ui/skeleton'

// LOW PRIORITY - Admin Bundle (deferred)
const Users = createOptimizedLazy(
  () => import('@/pages/Users'),
  RoutePriority.LOW
)
const Reports = createOptimizedLazy(
  () => import('@/pages/Reports'),
  RoutePriority.LOW
)
const SecurityAudit = createOptimizedLazy(
  () => import('@/pages/SecurityAudit'),
  RoutePriority.LOW
)
const Workflows = createOptimizedLazy(
  () => import('@/pages/Workflows'),
  RoutePriority.LOW
)
const SystemUsersPage = createOptimizedLazy(
  () => import('@/pages/SystemUsersPage'),
  RoutePriority.LOW
)

// Admin loading skeleton
const AdminSkeleton = () => (
  <div className="p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-28" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-20" />
      ))}
    </div>
    <Skeleton className="h-96 w-full" />
  </div>
)

export const adminRoutes: RouteConfig[] = [
  {
    path: '/users',
    element: (
      <Suspense fallback={<AdminSkeleton />}>
        <AdminFeatureBoundary>
          <Users />
        </AdminFeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/system-users',
    element: (
      <Suspense fallback={<AdminSkeleton />}>
        <AdminFeatureBoundary>
          <SystemUsersPage />
        </AdminFeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/reports',
    element: (
      <Suspense fallback={<AdminSkeleton />}>
        <AdminFeatureBoundary>
          <Reports />
        </AdminFeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/security-audit',
    element: (
      <Suspense fallback={<AdminSkeleton />}>
        <AdminFeatureBoundary>
          <SecurityAudit />
        </AdminFeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/workflows',
    element: (
      <Suspense fallback={<AdminSkeleton />}>
        <AdminFeatureBoundary>
          <Workflows />
        </AdminFeatureBoundary>
      </Suspense>
    )
  }
]