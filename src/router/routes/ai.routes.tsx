import { Suspense } from 'react'
import { RouteConfig } from '../types'
import { createOptimizedLazy, RoutePriority } from '@/utils/routeOptimizer'
import { FeatureBoundary } from '@/components/routing/FeatureBoundary'
import { Skeleton } from '@/components/ui/skeleton'

// LOW PRIORITY - AI & Advanced Bundle (deferred)
const AdvancedAI = createOptimizedLazy(
  () => import('@/pages/AdvancedAI'),
  RoutePriority.LOW
)
const AIAdmin = createOptimizedLazy(
  () => import('@/pages/AIAdmin'),
  RoutePriority.LOW
)
const IntelligentDashboard = createOptimizedLazy(
  () => import('@/pages/IntelligentDashboard'),
  RoutePriority.LOW
)
const Academia = createOptimizedLazy(
  () => import('@/pages/Academia'),
  RoutePriority.LOW
)
const AcademiaAdmin = createOptimizedLazy(
  () => import('@/pages/AcademiaAdmin'),
  RoutePriority.LOW
)

// AI loading skeleton
const AISkeleton = () => (
  <div className="p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-10 w-36" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-32" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-24" />
      </div>
    </div>
  </div>
)

export const aiRoutes: RouteConfig[] = [
  {
    path: '/advanced-ai',
    element: (
      <Suspense fallback={<AISkeleton />}>
        <FeatureBoundary feature="IA Avanzada">
          <AdvancedAI />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/ai-admin',
    element: (
      <Suspense fallback={<AISkeleton />}>
        <FeatureBoundary feature="Admin IA">
          <AIAdmin />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/intelligent-dashboard',
    element: (
      <Suspense fallback={<AISkeleton />}>
        <FeatureBoundary feature="Dashboard Inteligente">
          <IntelligentDashboard />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/academia',
    element: (
      <Suspense fallback={<AISkeleton />}>
        <FeatureBoundary feature="Academia">
          <Academia />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/academia-admin',
    element: (
      <Suspense fallback={<AISkeleton />}>
        <FeatureBoundary feature="Admin Academia">
          <AcademiaAdmin />
        </FeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/academia/admin',
    element: (
      <Suspense fallback={<AISkeleton />}>
        <FeatureBoundary feature="Admin Academia (alias)">
          <AcademiaAdmin />
        </FeatureBoundary>
      </Suspense>
    )
  }
]