/**
 * Features Index - Central export hub
 * 
 * Arquitectura por features implementada progresivamente.
 * Cada feature mantiene su propio contexto y lógica encapsulada.
 * 
 * Estructura planificada:
 * - Core Features: auth, contacts, cases, proposals, calendar, documents, time-tracking, dashboard
 * - Admin Features: users, organizations, reports  
 * - Specialized Features: ai, academy, integrations, workflows
 */

// Feature Types
export type {
  FeatureModule,
  FeatureConfig,
  FeaturePermissions,
  FeatureComponent,
  FeatureHook,
  FeatureService
} from './types'

// TODO: Uncomment as features are implemented
// export * from './auth'
// export * from './contacts'
// export * from './cases'
// export * from './proposals'
// export * from './calendar'
// export * from './documents'
// export * from './time-tracking'
// export * from './dashboard'
// export * from './users'
// export * from './organizations'
// export * from './reports'
// export * from './ai'
// export * from './academy'
// export * from './integrations'
// export * from './workflows'