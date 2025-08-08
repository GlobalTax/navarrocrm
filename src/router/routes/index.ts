
import { authRoutes } from './authRoutes'
import { publicRoutes } from './publicRoutes'
import { protectedRoutes } from './protectedRoutes'

// Domain-specific route modules
export { coreRoutes } from './core.routes'
export { clientRoutes } from './clients.routes'
export { caseRoutes } from './cases.routes'
export { communicationRoutes } from './communications.routes'
export { businessRoutes } from './business.routes'
export { hrRoutes } from './hr.routes'
export { adminRoutes } from './admin.routes'
export { integrationRoutes } from './integrations.routes'
export { aiRoutes } from './ai.routes'
export { facilitiesRoutes } from './facilities.routes'

export {
  authRoutes,
  publicRoutes,
  protectedRoutes
}

export * from './authRoutes'
export * from './publicRoutes' 
export * from './protectedRoutes'
