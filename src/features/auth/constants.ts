/**
 * Auth Feature Constants
 */

import { UserRole, UserPermissions } from './types'

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  WEAK_PASSWORD: 'Password too weak',
  SESSION_EXPIRED: 'Session has expired',
  UNAUTHORIZED: 'Unauthorized access',
  ORG_NOT_FOUND: 'Organization not found',
  PROFILE_UPDATE_FAILED: 'Failed to update profile',
  INVALID_TOKEN: 'Invalid or expired token',
  RATE_LIMITED: 'Too many attempts, please try again later'
} as const

export const AUTH_EVENTS = {
  SIGN_IN: 'SIGNED_IN',
  SIGN_OUT: 'SIGNED_OUT',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',
  USER_UPDATED: 'USER_UPDATED',
  PASSWORD_RECOVERY: 'PASSWORD_RECOVERY',
  EMAIL_CONFIRMED: 'EMAIL_CONFIRMED'
} as const

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  super_admin: {
    canManageUsers: true,
    canManageOrganization: true,
    canViewAllCases: true,
    canManageFinances: true,
    canAccessReports: true,
    canManageSettings: true
  },
  partner: {
    canManageUsers: true,
    canManageOrganization: true,
    canViewAllCases: true,
    canManageFinances: true,
    canAccessReports: true,
    canManageSettings: true
  },
  area_manager: {
    canManageUsers: false,
    canManageOrganization: false,
    canViewAllCases: true,
    canManageFinances: false,
    canAccessReports: true,
    canManageSettings: false
  },
  senior: {
    canManageUsers: false,
    canManageOrganization: false,
    canViewAllCases: false,
    canManageFinances: false,
    canAccessReports: false,
    canManageSettings: false
  },
  junior: {
    canManageUsers: false,
    canManageOrganization: false,
    canViewAllCases: false,
    canManageFinances: false,
    canAccessReports: false,
    canManageSettings: false
  },
  finance: {
    canManageUsers: false,
    canManageOrganization: false,
    canViewAllCases: false,
    canManageFinances: true,
    canAccessReports: true,
    canManageSettings: false
  },
  admin: {
    canManageUsers: true,
    canManageOrganization: false,
    canViewAllCases: true,
    canManageFinances: false,
    canAccessReports: true,
    canManageSettings: true
  }
}

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false
} as const

export const SESSION_CONFIG = {
  maxInactivityMinutes: 120,
  refreshThresholdMinutes: 15,
  rememberMeDays: 30
} as const