import { Outlet } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { RouteModule } from '../types'

// Import domain-specific route modules
import { coreRoutes } from './core.routes'
import { clientRoutes } from './clients.routes'
import { caseRoutes } from './cases.routes'
import { communicationRoutes } from './communications.routes'
import { businessRoutes } from './business.routes'
import { hrRoutes } from './hr.routes'
import { adminRoutes } from './admin.routes'
import { integrationRoutes } from './integrations.routes'
import { aiRoutes } from './ai.routes'
import { facilitiesRoutes } from './facilities.routes'
import { deedsRoutes } from './deeds.routes'

// Orchestrator - combines all domain routes with correct loading priorities
export const protectedRoutes: RouteModule = {
  routes: [
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <Outlet />
        </ProtectedRoute>
      ),
      children: [
        {
          path: '/',
          element: (
            <MainLayout>
              <Outlet />
            </MainLayout>
          ),
          children: [
            // CRITICAL routes (preloaded)
            ...coreRoutes,
            
            // HIGH priority routes (fast load)
            ...clientRoutes,
            ...caseRoutes,
            
            // MEDIUM priority routes (standard load)
            ...communicationRoutes,
            ...businessRoutes,
            ...hrRoutes,
            ...deedsRoutes,
            
            // LOW priority routes (deferred load)
            ...adminRoutes,
            ...integrationRoutes,
            ...aiRoutes,
            ...facilitiesRoutes
          ]
        }
      ]
    }
  ]
}