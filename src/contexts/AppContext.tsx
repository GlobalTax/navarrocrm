
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { AppState, AuthUser, UserRole } from './types'
import { useAuthActions } from './hooks/useAuthActions'

const AppContext = createContext<AppState | undefined>(undefined)

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const { signIn, signUp, signOut: baseSignOut } = useAuthActions()

  useEffect(() => {
    console.log('🚀 [AppContext] Inicializando autenticación...')
    
    // Función para manejar cambios de autenticación
    const handleAuthChange = async (event: string, session: Session | null) => {
      console.log('🔄 [AppContext] Auth event:', event)
      
      setSession(session)
      
      if (!session) {
        setUser(null)
        setAuthLoading(false)
        return
      }

      // Usuario básico primero
      const basicUser = session.user as AuthUser
      setUser(basicUser)
      setAuthLoading(false)
      
      // Intentar enriquecer perfil en segundo plano (sin bloquear)
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('role, org_id')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          const enrichedUser: AuthUser = {
            ...session.user,
            role: profile.role as UserRole,
            org_id: profile.org_id
          }
          setUser(enrichedUser)
        }
      } catch (error) {
        console.log('⚠️ [AppContext] No se pudo enriquecer el perfil:', error)
        // Mantener el usuario básico
      }
    }

    // Configurar listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)

    // Verificar sesión inicial
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        await handleAuthChange('initial', session)
      } catch (error) {
        console.error('❌ [AppContext] Error inicializando:', error)
        setAuthLoading(false)
      }
    }

    initializeAuth()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      await baseSignOut()
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error)
    }
    setUser(null)
    setSession(null)
  }

  const value: AppState = {
    user,
    session,
    authLoading,
    isSetup: true,
    setupLoading: false,
    isInitializing: authLoading,
    signIn,
    signUp,
    signOut,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
