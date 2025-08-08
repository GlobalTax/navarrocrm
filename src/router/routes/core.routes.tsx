import { Suspense } from 'react'
import { RouteConfig } from '../types'
import { createOptimizedLazy, RoutePriority } from '@/utils/routeOptimizer'
import { FeatureBoundary } from '@/components/routing/FeatureBoundary'
import { Skeleton } from '@/components/ui/skeleton'
import Index from '@/pages/Index' // No lazy - crítica

// CRITICAL ROUTES - Preloaded
const Dashboard = createOptimizedLazy(
  () => import('@/pages/Dashboard'),
  RoutePriority.CRITICAL
)

// Core loading skeleton
const CoreSkeleton = () => (
  <div className="p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-24" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-64 w-full" />
  </div>
)

export const coreRoutes: RouteConfig[] = [
  {
    path: '/',
    element: <Index />
  },
  {
    path: '/dashboard',
    element: (
      <Suspense fallback={<CoreSkeleton />}>
        <FeatureBoundary feature="Dashboard">
          <Dashboard />
        </FeatureBoundary>
      </Suspense>
    )
  }
]