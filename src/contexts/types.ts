
import { User, Session } from '@supabase/supabase-js'

export type UserRole = 'partner' | 'area_manager' | 'senior' | 'junior' | 'finance' | 'client'

export interface AuthUser extends User {
  role?: UserRole
  org_id?: string
  first_name?: string
  last_name?: string
  full_name?: string
}

export interface AppState {
  // Auth state
  user: AuthUser | null
  session: Session | null
  authLoading: boolean
  
  // System setup state
  isSetup: boolean | null
  setupLoading: boolean
  
  // Combined loading state
  isInitializing: boolean
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, role: UserRole, orgId: string) => Promise<void>
  signOut: () => Promise<void>
}
