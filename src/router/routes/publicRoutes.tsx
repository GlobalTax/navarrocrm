
import { RouteModule } from '../types'
import { lazy } from 'react'

// Página pública - no necesita lazy loading por su naturaleza crítica
import RoomOccupancyPanel from '@/pages/RoomOccupancyPanel'

// Página de firma de ofertas de trabajo - pública
const SignJobOffer = lazy(() => import('@/pages/SignJobOffer').then(module => ({ default: module.SignJobOffer })))

export const publicRoutes: RouteModule = {
  routes: [
    {
      path: '/panel-ocupacion',
      element: <RoomOccupancyPanel />
    },
    {
      path: '/sign-job-offer/:token',
      element: <SignJobOffer />
    }
  ]
}
