/**
 * Auth Feature - Módulo de autenticación centralizado
 * FASE 6: Migración a arquitectura basada en features
 */

// Types
export type { 
  AuthUser, 
  UserRole,
  AuthState,
  LoginCredentials,
  RegisterData
} from './types'

// Services
export { AuthService } from './services/AuthService'
export { ProfileService } from './services/ProfileService'

// Hooks
export { useAuth } from './hooks/useAuth'

// Utils
export { 
  validateEmail,
  validatePassword,
  isSessionValid,
  formatUserDisplayName
} from './utils'

// Constants
export { AUTH_ERRORS, AUTH_EVENTS, ROLE_PERMISSIONS } from './constants'