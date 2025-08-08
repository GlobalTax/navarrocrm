import { Suspense } from 'react'
import { RouteConfig } from '../types'
import { createOptimizedLazy, RoutePriority } from '@/utils/routeOptimizer'
import { FeatureBoundary } from '@/components/routing/FeatureBoundary'
import { Skeleton } from '@/components/ui/skeleton'

// MEDIUM PRIORITY - HR Bundle
const RecruitmentPage = createOptimizedLazy(
  () => import('@/pages/RecruitmentPage'),
  RoutePriority.MEDIUM
)
const EmployeesPage = createOptimizedLazy(
  () => import('@/pages/EmployeesPage'),
  RoutePriority.MEDIUM
)
const EmployeeDetailPage = createOptimizedLazy(
  () => import('@/pages/EmployeeDetailPage'),
  RoutePriority.MEDIUM
)
const CandidateDetailPage = createOptimizedLazy(
  () => import('@/pages/CandidateDetailPage'),
  RoutePriority.MEDIUM
)
const InterviewDetailPage = createOptimizedLazy(
  () => import('@/pages/InterviewDetailPage'),
  RoutePriority.MEDIUM
)
const JobOfferDetailPage = createOptimizedLazy(
  () => import('@/pages/JobOfferDetailPage'),
  RoutePriority.MEDIUM
)
const EmployeeOnboardingPage = createOptimizedLazy(
  () => import('@/pages/EmployeeOnboardingPage'),
  RoutePriority.MEDIUM
)

// HR loading skeleton
const HRSkeleton = () => (
  <div className="p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  </div>
)

export const hrRoutes: RouteConfig[] = [
  {
    path: '/employees',
    element: (
      <Suspense fallback={<HRSkeleton />}>
        <FeatureBoundary feature="Empleados">
          <EmployeesPage />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/employees/:id',
    element: (
      <Suspense fallback={<HRSkeleton />}>
        <FeatureBoundary feature="Empleados">
          <EmployeeDetailPage />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/employees/onboarding',
    element: (
      <Suspense fallback={<HRSkeleton />}>
        <FeatureBoundary feature="Onboarding de Empleados">
          <EmployeeOnboardingPage />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/recruitment',
    element: (
      <Suspense fallback={<HRSkeleton />}>
        <FeatureBoundary feature="Reclutamiento">
          <RecruitmentPage />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/recruitment/candidates/:id',
    element: (
      <Suspense fallback={<HRSkeleton />}>
        <FeatureBoundary feature="Reclutamiento">
          <CandidateDetailPage />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/recruitment/interviews/:id',
    element: (
      <Suspense fallback={<HRSkeleton />}>
        <FeatureBoundary feature="Reclutamiento">
          <InterviewDetailPage />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/recruitment/job-offers/:id',
    element: (
      <Suspense fallback={<HRSkeleton />}>
        <FeatureBoundary feature="Reclutamiento">
          <JobOfferDetailPage />
        </FeatureBoundary>
      </Suspense>
    )
  }
]