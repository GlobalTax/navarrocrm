/**
 * Auth Feature Utilities
 */

import { AuthUser, UserRole } from './types'
import { PASSWORD_REQUIREMENTS } from './constants'

/**
 * Validar formato de email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validar fortaleza de contraseña
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`)
  }
  
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Verificar si una sesión es válida
 */
export function isSessionValid(expiresAt?: number): boolean {
  if (!expiresAt) return false
  return Date.now() / 1000 < expiresAt
}

/**
 * Formatear nombre de usuario para mostrar
 */
export function formatUserDisplayName(user: AuthUser): string {
  if (user.display_name) {
    return user.display_name
  }
  
  const firstName = user.user_metadata?.first_name
  const lastName = user.user_metadata?.last_name
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }
  
  if (firstName) {
    return firstName
  }
  
  return user.email || 'Usuario'
}

/**
 * Obtener label amigable para rol de usuario
 */
export function getUserRoleLabel(role: UserRole): string {
  const roleLabels: Record<UserRole, string> = {
    super_admin: 'Super Administrador',
    partner: 'Partner',
    area_manager: 'Gerente de Área',
    senior: 'Senior',
    junior: 'Junior',
    finance: 'Finanzas',
    admin: 'Administrador'
  }
  
  return roleLabels[role] || role
}

/**
 * Verificar si un usuario puede realizar una acción
 */
export function canUserPerformAction(user: AuthUser | null, requiredRoles: UserRole[]): boolean {
  if (!user || !user.role) return false
  return requiredRoles.includes(user.role)
}

/**
 * Generar iniciales del usuario
 */
export function getUserInitials(user: AuthUser): string {
  const displayName = formatUserDisplayName(user)
  return displayName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}