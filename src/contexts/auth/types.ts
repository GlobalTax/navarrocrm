import { User, Session } from '@supabase/supabase-js'

export type UserRole = 'partner' | 'area_manager' | 'senior' | 'junior' | 'finance' | 'client'

export interface AuthUser extends User {
  role?: UserRole
  org_id?: string
}

export interface AuthState {
  user: AuthUser | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  activateAccount: (token: string, password: string) => Promise<{ error?: string }>
  clearError: () => void
}

export interface AuthContextType extends AuthState, AuthActions {}