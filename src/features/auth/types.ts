/**
 * Auth Feature Types
 */

import { User, Session } from '@supabase/supabase-js'

export type UserRole = 'super_admin' | 'partner' | 'area_manager' | 'senior' | 'junior' | 'finance' | 'admin'

export interface AuthUser extends User {
  role?: UserRole
  org_id?: string
  display_name?: string
  avatar_url?: string
  is_active?: boolean
  last_sign_in_at?: string
  // No redeclarar created_at ya que User ya lo tiene como requerido
}

export interface AuthState {
  user: AuthUser | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  role: UserRole | null
  orgId: string | null
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  firstName?: string
  lastName?: string
  organization?: string
}

export interface ProfileData {
  display_name?: string
  avatar_url?: string
  role?: UserRole
  org_id?: string
  is_active?: boolean
}

export interface SessionValidationResult {
  isValid: boolean
  user: AuthUser | null
  session: Session | null
  error?: string
}

export interface AuthError {
  code: string
  message: string
  details?: any
}

export interface UserPermissions {
  canManageUsers: boolean
  canManageOrganization: boolean
  canViewAllCases: boolean
  canManageFinances: boolean
  canAccessReports: boolean
  canManageSettings: boolean
}