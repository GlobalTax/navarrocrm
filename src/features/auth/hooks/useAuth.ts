/**
 * useAuth Hook - Hook principal de autenticación
 */

import { useState, useEffect, useRef } from 'react'
import { AuthService } from '../services/AuthService'
import { ProfileService } from '../services/ProfileService'
import { authLogger } from '@/utils/logging'
import type { AuthState, LoginCredentials, RegisterData } from '../types'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    role: null,
    orgId: null
  })

  const initRef = useRef(false)

  // Inicializar autenticación
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      authLogger.debug('Inicializando autenticación')

      const sessionResult = await AuthService.getCurrentSession()
      
      if (sessionResult.isValid && sessionResult.user && sessionResult.session) {
        // Enriquecer perfil del usuario
        const profile = await ProfileService.getUserProfile(sessionResult.user.id)
        
        const enrichedUser = {
          ...sessionResult.user,
          role: profile?.role,
          org_id: profile?.org_id,
          display_name: profile?.display_name,
          avatar_url: profile?.avatar_url,
          is_active: profile?.is_active
        }

        setAuthState({
          user: enrichedUser,
          session: sessionResult.session,
          isLoading: false,
          isAuthenticated: true,
          role: profile?.role || null,
          orgId: profile?.org_id || null
        })

        authLogger.info('Usuario autenticado', { 
          userId: enrichedUser.id,
          role: enrichedUser.role,
          orgId: enrichedUser.org_id 
        })
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false
        }))

        authLogger.debug('No hay usuario autenticado')
      }
    } catch (error) {
      authLogger.error('Error inicializando autenticación', { error })
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false
      }))
    }
  }

  const signIn = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      const result = await AuthService.signIn(credentials)
      
      if (result.error) {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: result.error }
      }

      if (result.user) {
        // Enriquecer perfil
        const profile = await ProfileService.getUserProfile(result.user.id)
        
        const enrichedUser = {
          ...result.user,
          role: profile?.role,
          org_id: profile?.org_id,
          display_name: profile?.display_name,
          avatar_url: profile?.avatar_url,
          is_active: profile?.is_active
        }

        // Obtener sesión actual
        const sessionResult = await AuthService.getCurrentSession()

        setAuthState({
          user: enrichedUser,
          session: sessionResult.session,
          isLoading: false,
          isAuthenticated: true,
          role: profile?.role || null,
          orgId: profile?.org_id || null
        })

        return { success: true, user: enrichedUser }
      }

      return { success: false, error: { code: 'UNKNOWN', message: 'Unknown error' } }
    } catch (error) {
      authLogger.error('Error en signIn', { error })
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return { success: false, error: { code: 'UNEXPECTED', message: 'Unexpected error' } }
    }
  }

  const signUp = async (userData: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      const result = await AuthService.signUp(userData)
      
      if (result.error) {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return { success: false, error: result.error }
      }

      setAuthState(prev => ({ ...prev, isLoading: false }))
      return { success: true, user: result.user }
    } catch (error) {
      authLogger.error('Error en signUp', { error })
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return { success: false, error: { code: 'UNEXPECTED', message: 'Unexpected error' } }
    }
  }

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      const result = await AuthService.signOut()
      
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        role: null,
        orgId: null
      })

      return { success: !result.error, error: result.error }
    } catch (error) {
      authLogger.error('Error en signOut', { error })
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        role: null,
        orgId: null
      })
      return { success: false, error: { code: 'UNEXPECTED', message: 'Unexpected error' } }
    }
  }

  return {
    // Estado
    ...authState,
    
    // Acciones
    signIn,
    signUp,
    signOut,
    
    // Funciones de utilidad
    refreshAuth: initializeAuth
  }
}