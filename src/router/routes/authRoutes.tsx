
import { lazy, Suspense } from 'react'
import { PageLoadingSkeleton } from '@/components/layout/PageLoadingSkeleton'
import { RouteModule } from '../types'

// Páginas de autenticación - no lazy para experiencia crítica
import Login from '@/pages/Login'
import Setup from '@/pages/Setup'
import Unauthorized from '@/pages/Unauthorized'

// Páginas con lazy loading
const OutlookCallback = lazy(() => import('@/pages/OutlookCallback'))
const ActivateAccount = lazy(() => import('@/pages/ActivateAccount'))

export const authRoutes: RouteModule = {
  routes: [
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/setup',
      element: <Setup />
    },
    {
      path: '/unauthorized',
      element: <Unauthorized />
    },
    {
      path: '/auth/outlook/callback',
      element: (
        <Suspense fallback={<PageLoadingSkeleton />}>
          <OutlookCallback />
        </Suspense>
      )
    },
    {
      path: '/activate-account',
      element: (
        <Suspense fallback={<PageLoadingSkeleton />}>
          <ActivateAccount />
        </Suspense>
      )
    }
  ]
}
