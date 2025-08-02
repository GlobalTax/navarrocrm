/**
 * Auth Service - Servicio centralizado de autenticación
 */

import { supabase } from '@/integrations/supabase/client'
import { authLogger } from '@/utils/logging'
import type { 
  AuthUser, 
  LoginCredentials, 
  RegisterData, 
  AuthError,
  SessionValidationResult 
} from '../types'
import { AUTH_ERRORS } from '../constants'

export class AuthService {
  /**
   * Iniciar sesión con email y contraseña
   */
  static async signIn(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      authLogger.info('Iniciando sesión', { 
        email: credentials.email,
        remember: credentials.remember 
      })

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) {
        authLogger.error('Error en inicio de sesión', { 
          error: error.message,
          email: credentials.email 
        })
        return { 
          user: null, 
          error: { 
            code: error.message, 
            message: AUTH_ERRORS.INVALID_CREDENTIALS 
          }
        }
      }

      authLogger.info('Sesión iniciada exitosamente', { 
        userId: data.user?.id,
        email: data.user?.email 
      })

      return { user: data.user as AuthUser, error: null }
    } catch (err) {
      authLogger.error('Error inesperado en inicio de sesión', { error: err })
      return { 
        user: null, 
        error: { 
          code: 'UNEXPECTED_ERROR', 
          message: 'An unexpected error occurred' 
        }
      }
    }
  }

  /**
   * Registrar nuevo usuario
   */
  static async signUp(userData: RegisterData): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      authLogger.info('Registrando nuevo usuario', { 
        email: userData.email,
        organization: userData.organization 
      })

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            organization: userData.organization
          }
        }
      })

      if (error) {
        authLogger.error('Error en registro', { 
          error: error.message,
          email: userData.email 
        })
        return { 
          user: null, 
          error: { 
            code: error.message, 
            message: error.message 
          }
        }
      }

      authLogger.info('Usuario registrado exitosamente', { 
        userId: data.user?.id,
        email: data.user?.email 
      })

      return { user: data.user as AuthUser, error: null }
    } catch (err) {
      authLogger.error('Error inesperado en registro', { error: err })
      return { 
        user: null, 
        error: { 
          code: 'UNEXPECTED_ERROR', 
          message: 'An unexpected error occurred' 
        }
      }
    }
  }

  /**
   * Cerrar sesión
   */
  static async signOut(): Promise<{ error: AuthError | null }> {
    try {
      authLogger.info('Cerrando sesión')

      const { error } = await supabase.auth.signOut()

      if (error) {
        authLogger.error('Error al cerrar sesión', { error: error.message })
        return { 
          error: { 
            code: error.message, 
            message: error.message 
          }
        }
      }

      authLogger.info('Sesión cerrada exitosamente')
      return { error: null }
    } catch (err) {
      authLogger.error('Error inesperado al cerrar sesión', { error: err })
      return { 
        error: { 
          code: 'UNEXPECTED_ERROR', 
          message: 'An unexpected error occurred' 
        }
      }
    }
  }

  /**
   * Obtener sesión actual
   */
  static async getCurrentSession(): Promise<SessionValidationResult> {
    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        authLogger.error('Error obteniendo sesión', { error: error.message })
        return { 
          isValid: false, 
          user: null, 
          session: null, 
          error: error.message 
        }
      }

      if (!data.session) {
        authLogger.debug('No hay sesión activa')
        return { 
          isValid: false, 
          user: null, 
          session: null 
        }
      }

      authLogger.debug('Sesión obtenida', { 
        userId: data.session.user?.id,
        expiresAt: data.session.expires_at 
      })

      return { 
        isValid: true, 
        user: data.session.user as AuthUser, 
        session: data.session 
      }
    } catch (err) {
      authLogger.error('Error inesperado obteniendo sesión', { error: err })
      return { 
        isValid: false, 
        user: null, 
        session: null, 
        error: 'Unexpected error' 
      }
    }
  }

  /**
   * Refrescar token de sesión
   */
  static async refreshSession(): Promise<SessionValidationResult> {
    try {
      authLogger.debug('Refrescando sesión')

      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        authLogger.error('Error refrescando sesión', { error: error.message })
        return { 
          isValid: false, 
          user: null, 
          session: null, 
          error: error.message 
        }
      }

      authLogger.info('Sesión refrescada exitosamente', { 
        userId: data.session?.user?.id 
      })

      return { 
        isValid: true, 
        user: data.session?.user as AuthUser, 
        session: data.session 
      }
    } catch (err) {
      authLogger.error('Error inesperado refrescando sesión', { error: err })
      return { 
        isValid: false, 
        user: null, 
        session: null, 
        error: 'Unexpected error' 
      }
    }
  }

  /**
   * Recuperación de contraseña
   */
  static async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      authLogger.info('Solicitando recuperación de contraseña', { email })

      const { error } = await supabase.auth.resetPasswordForEmail(email)

      if (error) {
        authLogger.error('Error en recuperación de contraseña', { 
          error: error.message,
          email 
        })
        return { 
          error: { 
            code: error.message, 
            message: error.message 
          }
        }
      }

      authLogger.info('Email de recuperación enviado', { email })
      return { error: null }
    } catch (err) {
      authLogger.error('Error inesperado en recuperación de contraseña', { error: err })
      return { 
        error: { 
          code: 'UNEXPECTED_ERROR', 
          message: 'An unexpected error occurred' 
        }
      }
    }
  }
}