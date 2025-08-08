import { Suspense } from 'react'
import { RouteConfig } from '../types'
import { createOptimizedLazy, RoutePriority } from '@/utils/routeOptimizer'
import { CaseFeatureBoundary } from '@/components/routing/FeatureBoundary'
import { Skeleton } from '@/components/ui/skeleton'

// HIGH PRIORITY - Case Management Bundle
const Cases = createOptimizedLazy(
  () => import('@/pages/Cases'),
  RoutePriority.HIGH
)
const CaseDetail = createOptimizedLazy(
  () => import('@/pages/CaseDetail'),
  RoutePriority.HIGH
)
const Tasks = createOptimizedLazy(
  () => import('@/pages/Tasks'),
  RoutePriority.HIGH
)
const TaskDetail = createOptimizedLazy(
  () => import('@/pages/TaskDetail'),
  RoutePriority.HIGH
)

// Cases loading skeleton
const CasesSkeleton = () => (
  <div className="p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
    <div className="space-y-2">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  </div>
)

export const caseRoutes: RouteConfig[] = [
  {
    path: '/cases',
    element: (
      <Suspense fallback={<CasesSkeleton />}>
        <CaseFeatureBoundary>
          <Cases />
        </CaseFeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/cases/:id',
    element: (
      <Suspense fallback={<CasesSkeleton />}>
        <CaseFeatureBoundary>
          <CaseDetail />
        </CaseFeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/tasks',
    element: (
      <Suspense fallback={<CasesSkeleton />}>
        <CaseFeatureBoundary>
          <Tasks />
        </CaseFeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/tasks/:id',
    element: (
      <Suspense fallback={<CasesSkeleton />}>
        <CaseFeatureBoundary>
          <TaskDetail />
        </CaseFeatureBoundary>
      </Suspense>
    )
  }
]