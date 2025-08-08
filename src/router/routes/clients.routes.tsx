import { Suspense } from 'react'
import { RouteConfig } from '../types'
import { createOptimizedLazy, RoutePriority } from '@/utils/routeOptimizer'
import { ClientFeatureBoundary } from '@/components/routing/FeatureBoundary'
import { Skeleton } from '@/components/ui/skeleton'

// HIGH PRIORITY - Client Management Bundle
const Contacts = createOptimizedLazy(
  () => import('@/pages/Contacts'),
  RoutePriority.HIGH
)
const ContactDetail = createOptimizedLazy(
  () => import('@/pages/ContactDetail'),
  RoutePriority.HIGH
)
const Clients = createOptimizedLazy(
  () => import('@/pages/Clients'),
  RoutePriority.HIGH
)
const ClientDetail = createOptimizedLazy(
  () => import('@/pages/ClientDetail'),
  RoutePriority.HIGH
)

// Clients loading skeleton
const ClientsSkeleton = () => (
  <div className="p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-40" />
    </div>
    <div className="flex gap-4 mb-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-24" />
    </div>
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  </div>
)

export const clientRoutes: RouteConfig[] = [
  {
    path: '/contacts',
    element: (
      <Suspense fallback={<ClientsSkeleton />}>
        <ClientFeatureBoundary>
          <Contacts />
        </ClientFeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/contacts/:id',
    element: (
      <Suspense fallback={<ClientsSkeleton />}>
        <ClientFeatureBoundary>
          <ContactDetail />
        </ClientFeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/clients',
    element: (
      <Suspense fallback={<ClientsSkeleton />}>
        <ClientFeatureBoundary>
          <Clients />
        </ClientFeatureBoundary>
      </Suspense>
    )
  },
  {
    path: '/client/:id',
    element: (
      <Suspense fallback={<ClientsSkeleton />}>
        <ClientFeatureBoundary>
          <ClientDetail />
        </ClientFeatureBoundary>
      </Suspense>
    )
  }
]