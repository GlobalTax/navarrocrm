// New unified context exports
export { AuthProvider, useAuth, type AuthUser, type UserRole } from './auth'
export { SystemProvider, useSystem } from './system/SystemProvider'
export { QueryProvider } from './QueryContext'

// Legacy export for backward compatibility during migration
export { useApp } from '../components/layout/AppMigrationWrapper'